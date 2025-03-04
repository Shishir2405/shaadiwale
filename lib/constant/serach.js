// lib/constants/search.js

export const AGE_RANGE = Array.from({ length: 43 }, (_, i) => ({
    value: (i + 18).toString(),
    label: `${i + 18} Year`
  }));
  
  export const HEIGHT_OPTIONS = [
    { value: "137", label: "Below 4ft 6in - 137cm" },
    { value: "139", label: "4ft 7in - 139cm" },
    { value: "142", label: "4ft 8in - 142cm" },
    { value: "144", label: "4ft 9in - 144cm" },
    { value: "147", label: "4ft 10in - 147cm" },
    { value: "149", label: "4ft 11in - 149cm" },
    { value: "152", label: "5ft - 152cm" },
    { value: "154", label: "5ft 1in - 154cm" },
    { value: "157", label: "5ft 2in - 157cm" },
    { value: "160", label: "5ft 3in - 160cm" },
    { value: "162", label: "5ft 4in - 162cm" },
    { value: "165", label: "5ft 5in - 165cm" },
    { value: "167", label: "5ft 6in - 167cm" },
    { value: "170", label: "5ft 7in - 170cm" },
    { value: "172", label: "5ft 8in - 172cm" },
    { value: "175", label: "5ft 9in - 175cm" },
    { value: "177", label: "5ft 10in - 177cm" },
    { value: "180", label: "5ft 11in - 180cm" },
    { value: "182", label: "6ft - 182cm" },
    { value: "185", label: "6ft 1in - 185cm" },
    { value: "187", label: "6ft 2in - 187cm" },
    { value: "190", label: "6ft 3in - 190cm" },
    { value: "193", label: "6ft 4in - 193cm" }
  ];
  
  export const MARITAL_STATUS = [
    { value: "never_married", label: "Never Married" },
    { value: "widowed", label: "Widower" },
    { value: "divorced", label: "Divorced" },
    { value: "awaiting_divorce", label: "Awaiting Divorce" }
  ];
  
  export const RELIGIONS = [
    { value: "hindu", label: "Hindu" },
    { value: "muslim", label: "Muslim" },
    { value: "christian", label: "Christian" },
    { value: "sikh", label: "Sikh" },
    { value: "jain_digambar", label: "Jain - Digambar" },
    { value: "jain_shwetambar", label: "Jain - Shwetambar" }
  ];
  
  export const EDUCATION = [
    { value: "b_arch", label: "B Arch" },
    { value: "b_com", label: "B Com" },
    { value: "b_tech", label: "B Tech" },
    { value: "bba", label: "BBA" },
    { value: "bca", label: "BCA" },
    { value: "be", label: "BE" },
    { value: "mbbs", label: "MBBS" },
    { value: "mca", label: "MCA" },
    { value: "mba", label: "MBA" }
    // Add all education options
  ];
  
  export const OCCUPATIONS = [
    { value: "chartered_accountant", label: "Chartered Accountant" },
    { value: "company_secretary", label: "Company Secretary" },
    { value: "doctor", label: "Doctor" },
    { value: "engineer", label: "Engineer" },
    { value: "lawyer", label: "Lawyer" },
    { value: "professor", label: "Professor" },
    { value: "software_developer", label: "Software Developer" }
    // Add all occupation options
  ];
  
  export const ANNUAL_INCOME = [
    { value: "50000", label: "50,000" },
    { value: "100000", label: "1,00,000" },
    { value: "200000", label: "2,00,000" },
    { value: "300000", label: "3,00,000" },
    { value: "400000", label: "4,00,000" },
    { value: "500000", label: "5,00,000" },
    { value: "750000", label: "7,50,000" },
    { value: "1000000", label: "10,00,000" },
    { value: "1500000", label: "15,00,000" }
    // Add all income options
  ];
  
  export const CASTES = {
    hindu: [
      "Brahmin",
      "Kshatriya",
      "Vaishya",
      "Kayastha",
      "Maratha",
      "Rajput",
      "Gupta",
      "Agarwal",
      "Nair",
      "Ezhava",
      "Kumhar",
      "Yadav"
    ],
    muslim: [
      "Shia",
      "Sunni",
      "Ansari",
      "Khan",
      "Syed",
      "Pathan",
      "Sheikh",
      "Qureshi"
    ],
    christian: [
      "Roman Catholic",
      "Protestant",
      "Orthodox",
      "Pentecostal",
      "Baptist",
      "Evangelical"
    ],
    sikh: [
      "Jatt",
      "Khatri",
      "Ramgharia",
      "Arora",
      "Ahluwalia",
      "Majhabi"
    ]
  };
  
  export const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];