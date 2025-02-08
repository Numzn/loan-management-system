export const checkEnvironment = () => {
  const requiredVars = {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY
  };

  const issues = [];
  
  // Check each variable
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      issues.push(`${key} is missing`);
    } else if (value.includes('your-') || value.includes('your_')) {
      issues.push(`${key} appears to be using placeholder value`);
    }
  });

  // Specific URL format check
  if (requiredVars.REACT_APP_SUPABASE_URL && 
      !requiredVars.REACT_APP_SUPABASE_URL.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    issues.push('REACT_APP_SUPABASE_URL format appears invalid');
  }

  // Specific Anon Key format check
  if (requiredVars.REACT_APP_SUPABASE_ANON_KEY && 
      !requiredVars.REACT_APP_SUPABASE_ANON_KEY.match(/^ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
    issues.push('REACT_APP_SUPABASE_ANON_KEY format appears invalid');
  }

  return {
    success: issues.length === 0,
    issues,
    values: {
      url: requiredVars.REACT_APP_SUPABASE_URL,
      keyLength: requiredVars.REACT_APP_SUPABASE_ANON_KEY?.length || 0
    }
  };
}; 