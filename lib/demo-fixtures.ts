export const DEMO_WORKSPACE_FIXTURE = {
  name: "Demo Workspace",
  description:
    "Starter workspace with sample shopping lists, planned purchases, and projects.",
  projects: [
    {
      key: "homeRefresh",
      name: "Home Refresh",
      description: "Furniture and household upgrades to compare before buying.",
      budget: "15000",
    },
    {
      key: "deskSetup",
      name: "Desk Setup",
      description: "Workstation items grouped into one buying plan.",
      budget: "50000",
    },
  ],
  essentials: [
    { title: "Rice", price: "1800", quantity: 1, status: "PENDING" },
    {
      title: "Coffee beans",
      price: "1200",
      quantity: 2,
      status: "PENDING",
    },
    {
      title: "Laundry detergent",
      price: "850",
      quantity: 1,
      status: "PURCHASED",
    },
  ],
  planned: [
    {
      title: "Ergonomic chair",
      price: "32000",
      quantity: 1,
      priority: "HIGH",
      status: "PENDING",
      imageKey: "ergonomicChair",
      productUrl: "https://example.com/ergonomic-chair",
      description: "Compare lumbar support and delivery options.",
      projectKey: "deskSetup",
    },
    {
      title: "Monitor light bar",
      price: "6800",
      quantity: 1,
      priority: "MEDIUM",
      status: "PENDING",
      imageKey: "monitorLightBar",
      productUrl: "https://example.com/monitor-light-bar",
      description: "Check desk depth and monitor compatibility.",
      projectKey: "deskSetup",
    },
    {
      title: "Storage baskets",
      price: "2400",
      quantity: 3,
      priority: "LOW",
      status: "PENDING",
      imageKey: "storageBaskets",
      description: "For closet and pantry organization.",
      projectKey: "homeRefresh",
    },
    {
      title: "Air purifier filter",
      price: "5200",
      quantity: 1,
      priority: "URGENT",
      status: "PENDING",
      imageKey: "airPurifierFilter",
      description: "Replacement filter before the next cleaning cycle.",
      projectKey: "homeRefresh",
    },
    {
      title: "USB-C hub",
      price: "4500",
      quantity: 1,
      priority: "MEDIUM",
      status: "PURCHASED",
      imageKey: "usbCHub",
      projectKey: "deskSetup",
    },
    {
      title: "Reusable water bottle",
      price: "1900",
      quantity: 1,
      priority: "LOW",
      status: "CANCELLED",
      imageKey: "reusableWaterBottle",
      description: "Kept as an example of a cancelled planned item.",
    },
  ],
} as const;

export const DEMO_PLANNED_IMAGES = {
  cloudinary: {
    ergonomicChair:
      "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965808/to-buy-pj/demo-planned-items/ergonomic-chair.jpg",
    monitorLightBar:
      "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965808/to-buy-pj/demo-planned-items/monitor-light-bar.jpg",
    storageBaskets:
      "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965809/to-buy-pj/demo-planned-items/storage-baskets.jpg",
    airPurifierFilter:
      "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965810/to-buy-pj/demo-planned-items/air-purifier-filter.jpg",
    usbCHub:
      "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965812/to-buy-pj/demo-planned-items/usb-c-hub.jpg",
    reusableWaterBottle:
      "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965813/to-buy-pj/demo-planned-items/reusable-water-bottle.jpg",
  },
  local: {
    ergonomicChair:
      "/images/demo-planned/cloudinary-upload/ergonomic-chair.jpg",
    monitorLightBar:
      "/images/demo-planned/cloudinary-upload/monitor-light-bar.jpg",
    storageBaskets:
      "/images/demo-planned/cloudinary-upload/storage-baskets.jpg",
    airPurifierFilter:
      "/images/demo-planned/cloudinary-upload/air-purifier-filter.jpg",
    usbCHub: "/images/demo-planned/cloudinary-upload/usb-c-hub.jpg",
    reusableWaterBottle:
      "/images/demo-planned/cloudinary-upload/reusable-water-bottle.jpg",
  },
} as const;

export type DemoProjectKey =
  (typeof DEMO_WORKSPACE_FIXTURE.projects)[number]["key"];

export type DemoImageSource = keyof typeof DEMO_PLANNED_IMAGES;
