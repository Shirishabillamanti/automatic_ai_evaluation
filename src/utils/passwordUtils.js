/**
 * Calculates password strength score (0 to 4)
 * @param {string} pwd
 */
export const calculatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
    default:
      return { score: 0, label: 'Too short (min 8 chars)', color: 'bg-slate-200', textColor: 'text-slate-400' };
  }
};

export default calculatePasswordStrength;
