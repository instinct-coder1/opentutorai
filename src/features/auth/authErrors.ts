const knownMessages: Array<[string, string]> = [
  ['Invalid login credentials', 'Email or password is incorrect. If you had an account before our move, choose "Set a new password" below.'],
  ['User already registered', 'An account with this email already exists. Try signing in instead.'],
  ['already been registered', 'An account with this email already exists. Try signing in instead.'],
  ['Password should be at least', 'Your password must be at least 6 characters.'],
  ['weak', 'That password is too easy to guess. Please choose a stronger one.'],
  ['same as the old', 'Please choose a password you have not used before.'],
  ['Email not confirmed', 'Please check your inbox to confirm your email before signing in.'],
  ['is invalid', 'Please enter a valid email address.'],
  ['Unable to validate email', 'Please enter a valid email address.'],
  ['could not be delivered', "We couldn't deliver email to that address recently. Check it's correct or try another one."],
  ['Failed to fetch', 'Network problem. Check your connection and try again.'],
  ['NetworkError', 'Network problem. Check your connection and try again.'],
  ['rate limit', 'Too many attempts. Please wait a moment and try again.'],
];

export function friendlyAuthError(message: string): string {
  const match = knownMessages.find(([fragment]) => message.includes(fragment));
  return match ? match[1] : 'Something went wrong. Please try again.';
}
