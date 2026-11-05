// House ads promote StorySpace itself. They run in the homepage banner until
// an ad network is approved, and they're labelled "Advertisement" on screen.
export type HouseAd = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const houseAds: HouseAd[] = [
  {
    id: "ad-earn",
    title: "Create and earn",
    description: "Publish a book on StorySpace and receive payments from your readers.",
    href: "/signup",
  },
  {
    id: "ad-verify",
    title: "Get verified",
    description: "Once your work is published, request a verified badge.",
    href: "/verify",
  },
];
