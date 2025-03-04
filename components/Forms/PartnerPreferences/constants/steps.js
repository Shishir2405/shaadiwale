// components/Forms/PartnerPreferences/constants/steps.js
export const steps = [
  { id: 1, title: "Basic Preferences" },
  { id: 2, title: "Lifestyle" },
  { id: 3, title: "Religion" },
  { id: 4, title: "Location" },
  { id: 5, title: "Education & Career" },
];

// components/Forms/PartnerPreferences/constants/preferenceConstants.js
export const AGE_RANGE = Array.from({ length: 43 }, (_, i) => ({
  value: (i + 18).toString(),
  label: `${i + 18} Years`,
}));

export const HEIGHT_OPTIONS = [
  "4ft 6in - 137cm",
  "4ft 7in - 139cm",
  "4ft 8in - 142cm",
  "4ft 9in - 144cm",
  "4ft 10in - 147cm",
  "4ft 11in - 149cm",
  "5ft - 152cm",
  "5ft 1in - 154cm",
  "5ft 2in - 157cm",
  "5ft 3in - 160cm",
  "5ft 4in - 162cm",
  "5ft 5in - 165cm",
  "5ft 6in - 167cm",
  "5ft 7in - 170cm",
  "5ft 8in - 172cm",
  "5ft 9in - 175cm",
  "5ft 10in - 177cm",
  "5ft 11in - 180cm",
  "6ft - 182cm",
].map((height) => ({ value: height, label: height }));

export const MARITAL_STATUS_OPTIONS = [
  { value: "nevermarried", label: "Never Married" },
  { value: "widowed", label: "Widowed" },
  { value: "divorced", label: "Divorced" },
  { value: "awaitingdivorce", label: "Awaiting Divorce" },
];

export const PHYSICAL_STATUS_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "physicallychallenged", label: "Physically Challenged" },
];

export const DIET_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "nonvegetarian", label: "Non-Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
];

export const SMOKING_OPTIONS = [
  { value: "never", label: "Never Smokes" },
  { value: "occasionally", label: "Occasionally" },
  { value: "regularly", label: "Regularly" },
];

export const DRINKING_OPTIONS = [
  { value: "never", label: "Never Drinks" },
  { value: "occasionally", label: "Occasionally" },
  { value: "regularly", label: "Regularly" },
];

export const RELIGION_OPTIONS = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "christian", label: "Christian" },
  { value: "sikh", label: "Sikh" },
  { value: "jain", label: "Jain" },
  { value: "buddhist", label: "Buddhist" },
];

export const EDUCATION_OPTIONS = [
  { value: "btech", label: "B.Tech" },
  { value: "mtech", label: "M.Tech" },
  { value: "bba", label: "BBA" },
  { value: "mba", label: "MBA" },
  { value: "mbbs", label: "MBBS" },
  { value: "md", label: "MD" },
  { value: "ca", label: "CA" },
];

export const OCCUPATION_OPTIONS = [
  { value: "private_sector", label: "Private Sector" },
  { value: "government", label: "Government/PSU" },
  { value: "business", label: "Business" },
  { value: "doctor", label: "Doctor" },
  { value: "teacher", label: "Teacher" },
];

export const INCOME_RANGES = [
  { value: "0", label: "No Preference" },
  { value: "300000", label: "3 LPA+" },
  { value: "500000", label: "5 LPA+" },
  { value: "750000", label: "7.5 LPA+" },
  { value: "1000000", label: "10 LPA+" },
  { value: "1500000", label: "15 LPA+" },
  { value: "2000000", label: "20 LPA+" },
];
