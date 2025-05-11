-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  user_id UUID,
  p_currency TEXT,
  p_theme TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE profiles
    SET 
      preferred_currency = p_currency,
      theme_preference = p_theme,
      updated_at = NOW()
    WHERE id = user_id
    RETURNING to_jsonb(profiles.*) INTO result;
  ELSE
    -- Insert new profile
    INSERT INTO profiles (
      id,
      preferred_currency,
      theme_preference,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      p_currency,
      p_theme,
      NOW(),
      NOW()
    )
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
