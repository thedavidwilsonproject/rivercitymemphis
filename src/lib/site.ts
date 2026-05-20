export const SITE_URL = "https://rivercitymemphis.org";

export const ORG = {
  name: "River City Church",
  legalName: "River City Church",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.svg`,
  email: "info@rivercitymemphis.org",
  phone: "+1-901-386-4171",
  address: {
    street: "3871 Kirby Whitten Parkway",
    locality: "Bartlett",
    region: "TN",
    postalCode: "38135",
    country: "US",
  },
  geo: {
    latitude: 35.2295,
    longitude: -89.8412,
  },
  serviceTime: {
    day: "Sunday",
    opens: "10:15",
    closes: "11:30",
    description: "Sunday worship service · coffee 15 minutes prior",
  },
  socials: [
    "https://www.facebook.com/RiverCityChurchBartlett",
    "https://twitter.com/rivercitymem",
    "https://www.instagram.com/rivercitymemphis",
    "https://vimeo.com/rivercitychurch",
  ],
} as const;
