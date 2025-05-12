-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  p_display_name TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE profiles
    SET 
      display_name = p_display_name,
      updated_at = NOW()
    WHERE id = user_id
    RETURNING to_jsonb(profiles.*) INTO result;
  ELSE
    -- Insert new profile
    INSERT INTO profiles (
      id,
      display_name,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      p_display_name,
      NOW(),
      NOW()
    )
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;
  
  -- Update user metadata in auth.users
  -- This is done with SECURITY DEFINER to bypass RLS
  BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN 
          jsonb_build_object('full_name', p_display_name)
        ELSE
          raw_user_meta_data || jsonb_build_object('full_name', p_display_name)
      END
    WHERE id = user_id;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but continue (we still want to update the profile)
    RAISE LOG 'Error updating auth.users metadata: %', SQLERRM;
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
