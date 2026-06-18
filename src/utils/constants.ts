/**
 * @fileoverview All constants for CarbonCringe — emission factors, category
 * metadata, localStorage keys, and the actions library.
 *
 * Sources for emission factors:
 * - Transport: UK DEFRA GHG Conversion Factors 2023
 * - Food: Poore & Nemecek (2018), Science; BBC Good Food analysis
 * - Energy: IEA average grid intensity; manufacturer energy data
 * - Shopping: MIT Carbon Footprint study; WRAP circular economy data
 *
 * ⚠️ Disclaimer: These are estimates based on global averages.
 * Actual values vary by location, provider, and individual behaviour.
 */

import type {
  ActivityCategory,
  ActivityType,
  ActionItem,
  EmissionFactor,
} from "@/types";

// ─── localStorage Keys ────────────────────────────────────────────────────────

/** All localStorage key strings used throughout the app */
export const STORAGE_KEYS = {
  ACTIVITY_LOG: "cc_activity_log",
  STREAK_DATA: "cc_streak_data",
  CHAT_HISTORY: "cc_chat_history",
  ACTION_COMPLETIONS: "cc_action_completions",
  SESSION_ID: "cc_session_id",
  ONBOARDING_DONE: "cc_onboarding_done",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─── Emission Thresholds ──────────────────────────────────────────────────────

/** Daily CO2e threshold (kg) below which a day is considered "low impact" */
export const LOW_IMPACT_THRESHOLD_KG = 5;

/** Global average daily carbon footprint (kg CO2e) for comparison */
export const GLOBAL_AVG_DAILY_KG = 13.5;

/** UK average daily carbon footprint (kg CO2e) */
export const UK_AVG_DAILY_KG = 9.6;

/** Carbon footprint of one tree absorbing CO2 for a year (kg CO2e) */
export const KG_CO2_PER_TREE_YEAR = 21;

/** kg CO2e per km driven in an average petrol car */
export const KG_CO2_PER_CAR_KM = 0.192;

/** kg CO2e per smartphone charge */
export const KG_CO2_PER_PHONE_CHARGE = 0.005;

/** kg CO2e per hour of Netflix streaming (device + server) */
export const KG_CO2_PER_NETFLIX_HOUR = 0.036;

// ─── Emission Factors ─────────────────────────────────────────────────────────

/**
 * Standard emission factors (kg CO2e per unit).
 * Units vary: km for transport, meals for food, hours for energy, orders for shopping.
 */
export const EMISSION_FACTORS: Readonly<Record<ActivityType, EmissionFactor>> =
  {
    // Transport (per km)
    car: {
      activityType: "car",
      kgCO2ePerUnit: 0.192,
      unit: "km",
      description: "Average petrol car per km",
    },
    bus: {
      activityType: "bus",
      kgCO2ePerUnit: 0.089,
      unit: "km",
      description: "Average local bus per km",
    },
    bike: {
      activityType: "bike",
      kgCO2ePerUnit: 0.0,
      unit: "km",
      description: "Cycling — zero direct emissions",
    },
    walk: {
      activityType: "walk",
      kgCO2ePerUnit: 0.0,
      unit: "km",
      description: "Walking — zero direct emissions",
    },
    flight_short: {
      activityType: "flight_short",
      kgCO2ePerUnit: 0.255,
      unit: "km",
      description: "Short-haul flight per km (economy, includes RFI)",
    },
    flight_long: {
      activityType: "flight_long",
      kgCO2ePerUnit: 0.195,
      unit: "km",
      description: "Long-haul flight per km (economy, includes RFI)",
    },

    // Food (per meal/order)
    meat_meal: {
      activityType: "meat_meal",
      kgCO2ePerUnit: 3.3,
      unit: "meal",
      description: "Average beef/lamb-based meal",
    },
    vegetarian_meal: {
      activityType: "vegetarian_meal",
      kgCO2ePerUnit: 1.0,
      unit: "meal",
      description: "Average vegetarian meal",
    },
    vegan_meal: {
      activityType: "vegan_meal",
      kgCO2ePerUnit: 0.7,
      unit: "meal",
      description: "Average plant-based vegan meal",
    },
    food_delivery: {
      activityType: "food_delivery",
      kgCO2ePerUnit: 0.5,
      unit: "order",
      description:
        "Extra packaging + delivery emissions on top of meal footprint",
    },

    // Energy (per hour of use)
    ac_usage: {
      activityType: "ac_usage",
      kgCO2ePerUnit: 0.6,
      unit: "hour",
      description: "Average AC unit per hour (mixed grid)",
    },
    electric_appliance: {
      activityType: "electric_appliance",
      kgCO2ePerUnit: 0.23,
      unit: "hour",
      description: "Average electric appliance per hour",
    },
    heating: {
      activityType: "heating",
      kgCO2ePerUnit: 0.45,
      unit: "hour",
      description: "Gas central heating per hour",
    },

    // Shopping (per order/item)
    online_order: {
      activityType: "online_order",
      kgCO2ePerUnit: 1.5,
      unit: "order",
      description: "Average online order (packaging + last-mile delivery)",
    },
    fast_fashion: {
      activityType: "fast_fashion",
      kgCO2ePerUnit: 6.0,
      unit: "item",
      description: "New fast fashion item (production + shipping)",
    },
    secondhand: {
      activityType: "secondhand",
      kgCO2ePerUnit: 0.25,
      unit: "item",
      description: "Secondhand/thrifted item (minimal new production)",
    },
    grocery: {
      activityType: "grocery",
      kgCO2ePerUnit: 0.8,
      unit: "trip",
      description: "Average grocery run (mixed basket, local store)",
    },
  } as const;

// ─── Category Metadata ────────────────────────────────────────────────────────

/** Display metadata for each activity category */
export const CATEGORY_METADATA: Readonly<
  Record<
    ActivityCategory,
    {
      label: string;
      emoji: string;
      color: string;
      glowColor: string;
      description: string;
    }
  >
> = {
  transport: {
    label: "Transport",
    emoji: "🚗",
    color: "#7AFCD6",
    glowColor: "rgba(122,252,214,0.2)",
    description: "How you get around",
  },
  food: {
    label: "Food",
    emoji: "🍖",
    color: "#FFD93D",
    glowColor: "rgba(255,217,61,0.2)",
    description: "What you eat and how it's delivered",
  },
  energy: {
    label: "Energy",
    emoji: "⚡",
    color: "#FF6B6B",
    glowColor: "rgba(255,107,107,0.2)",
    description: "Home energy use",
  },
  shopping: {
    label: "Shopping",
    emoji: "🛍️",
    color: "#a78bfa",
    glowColor: "rgba(167,139,250,0.2)",
    description: "Online orders & purchases",
  },
} as const;

/** Activity type display metadata */
export const ACTIVITY_METADATA: Readonly<
  Record<
    ActivityType,
    {
      label: string;
      emoji: string;
      category: ActivityCategory;
      defaultQuantity: number;
      quantityStep: number;
      maxQuantity: number;
    }
  >
> = {
  car: {
    label: "Car",
    emoji: "🚗",
    category: "transport",
    defaultQuantity: 10,
    quantityStep: 5,
    maxQuantity: 500,
  },
  bus: {
    label: "Bus / Transit",
    emoji: "🚌",
    category: "transport",
    defaultQuantity: 10,
    quantityStep: 5,
    maxQuantity: 200,
  },
  bike: {
    label: "Bike 🌱",
    emoji: "🚲",
    category: "transport",
    defaultQuantity: 5,
    quantityStep: 1,
    maxQuantity: 100,
  },
  walk: {
    label: "Walk 🌱",
    emoji: "🚶",
    category: "transport",
    defaultQuantity: 2,
    quantityStep: 1,
    maxQuantity: 30,
  },
  flight_short: {
    label: "Short-haul flight",
    emoji: "✈️",
    category: "transport",
    defaultQuantity: 500,
    quantityStep: 100,
    maxQuantity: 5000,
  },
  flight_long: {
    label: "Long-haul flight",
    emoji: "🌍",
    category: "transport",
    defaultQuantity: 3000,
    quantityStep: 500,
    maxQuantity: 15000,
  },
  meat_meal: {
    label: "Meat meal",
    emoji: "🥩",
    category: "food",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 10,
  },
  vegetarian_meal: {
    label: "Veggie meal",
    emoji: "🥗",
    category: "food",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 10,
  },
  vegan_meal: {
    label: "Vegan meal 🌱",
    emoji: "🥦",
    category: "food",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 10,
  },
  food_delivery: {
    label: "Food delivery",
    emoji: "📦",
    category: "food",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 5,
  },
  ac_usage: {
    label: "AC / cooling",
    emoji: "❄️",
    category: "energy",
    defaultQuantity: 4,
    quantityStep: 1,
    maxQuantity: 24,
  },
  electric_appliance: {
    label: "Heavy appliances",
    emoji: "🔌",
    category: "energy",
    defaultQuantity: 2,
    quantityStep: 1,
    maxQuantity: 12,
  },
  heating: {
    label: "Heating",
    emoji: "🔥",
    category: "energy",
    defaultQuantity: 4,
    quantityStep: 1,
    maxQuantity: 24,
  },
  online_order: {
    label: "Online order",
    emoji: "📫",
    category: "shopping",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 10,
  },
  fast_fashion: {
    label: "Fast fashion item",
    emoji: "👗",
    category: "shopping",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 10,
  },
  secondhand: {
    label: "Secondhand / thrift 🌱",
    emoji: "♻️",
    category: "shopping",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 10,
  },
  grocery: {
    label: "Grocery run",
    emoji: "🛒",
    category: "shopping",
    defaultQuantity: 1,
    quantityStep: 1,
    maxQuantity: 5,
  },
} as const;

// ─── Actions Library ──────────────────────────────────────────────────────────

/** 22 curated bite-sized habits — the Simple Actions Library */
export const ACTIONS_LIBRARY: readonly ActionItem[] = [
  // Transport
  {
    id: "walk-short-trips",
    title: "Walk trips under 1km",
    description: "Any trip you'd normally drive that's under 1km — just walk it.",
    category: "transport",
    effort: "easy",
    impact: "low",
    estimatedWeeklySavingKgCO2e: 1.3,
    tip: "1km walk = ~0.19kg CO2 saved. Do it every day and that's a tree's monthly work 🌳",
  },
  {
    id: "bus-commute",
    title: "Take the bus one day/week",
    description: "Swap your car commute for public transit just once a week.",
    category: "transport",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 2.1,
    tip: "You save money AND emissions. The bus is kinda a cheat code fr",
  },
  {
    id: "wfh-day",
    title: "Work from home one extra day",
    description: "One less commute per week adds up fast over a year.",
    category: "transport",
    effort: "medium",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 1.9,
    tip: "Also: no pants required. Win-win situation bestie",
  },
  {
    id: "no-flight-weekend",
    title: "Take a train instead of flying",
    description: "For trips under 500km, trains can be just as fast and 90% lower carbon.",
    category: "transport",
    effort: "medium",
    impact: "high",
    estimatedWeeklySavingKgCO2e: 45.0,
    tip: "London to Paris by train? 90% less CO2 than flying. Plus the views slap 🚄",
  },
  {
    id: "carpool",
    title: "Carpool to work",
    description: "Split your commute emissions in half by sharing a ride.",
    category: "transport",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 2.5,
    tip: "Half the emissions, someone to rant to about traffic. Solid deal",
  },

  // Food
  {
    id: "meatless-monday",
    title: "Meatless Monday",
    description: "Skip meat for one full day per week — any day works, Monday just sounds cool.",
    category: "food",
    effort: "easy",
    impact: "high",
    estimatedWeeklySavingKgCO2e: 2.3,
    tip: "Swapping beef for lentils even once a week = big CO2 W. Your gut also thanks you 🫘",
  },
  {
    id: "no-beef-week",
    title: "Skip beef this week",
    description: "Beef is the most carbon-intensive food. Even chicken is 10x better.",
    category: "food",
    effort: "easy",
    impact: "high",
    estimatedWeeklySavingKgCO2e: 7.0,
    tip: "Beef has the audacity to produce 60kg CO2 per kg of protein. Iconic villain energy 💀",
  },
  {
    id: "cook-at-home",
    title: "Cook at home instead of delivery",
    description: "Food delivery adds packaging, delivery emissions, and a sad Thursday feeling.",
    category: "food",
    effort: "medium",
    impact: "low",
    estimatedWeeklySavingKgCO2e: 1.0,
    tip: "Save the delivery fee + 0.5kg CO2 per order. That's a Netflix subscription's worth monthly 💸",
  },
  {
    id: "reduce-food-waste",
    title: "Zero food waste day",
    description: "Eat what you have before ordering more. Food waste = double the emissions.",
    category: "food",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 1.5,
    tip: "The UK throws away 9.5M tonnes of food a year. Don't be part of the statistic bestie",
  },
  {
    id: "local-seasonal",
    title: "Buy local & seasonal produce",
    description: "Locally grown food skips the air freight and massive cold storage emissions.",
    category: "food",
    effort: "medium",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 1.8,
    tip: "Asparagus flown from Peru in January has a carbon footprint bigger than your ego 😅",
  },

  // Energy
  {
    id: "ac-less",
    title: "Raise AC temp by 2°C",
    description: "Set your AC to 24°C instead of 22°C — barely noticeable, big savings.",
    category: "energy",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 2.8,
    tip: "Each degree less = ~10% energy saving. Your AC is basically a carbon printer rn 🖨️",
  },
  {
    id: "unplug-standby",
    title: "Unplug devices on standby",
    description: "Standby mode still draws power. Unplug chargers, TVs, consoles when not in use.",
    category: "energy",
    effort: "easy",
    impact: "low",
    estimatedWeeklySavingKgCO2e: 0.5,
    tip: "UK households waste £147/year on standby. That's like... a lot of coffee ☕",
  },
  {
    id: "cold-laundry",
    title: "Wash clothes at 30°C",
    description: "Modern detergents work great at 30°C. 40°C uses 40% more energy.",
    category: "energy",
    effort: "easy",
    impact: "low",
    estimatedWeeklySavingKgCO2e: 0.7,
    tip: "Cold wash = cleaner conscience + clothes that last longer. double W",
  },
  {
    id: "shorter-shower",
    title: "2-minute shorter shower",
    description: "Cut your daily shower by just 2 minutes to save hot water energy.",
    category: "energy",
    effort: "easy",
    impact: "low",
    estimatedWeeklySavingKgCO2e: 0.6,
    tip: "Make it a game — shower to one song. If the chorus hits twice you've been in too long 🎵",
  },
  {
    id: "led-lighting",
    title: "Switch to LED bulbs",
    description: "LEDs use 90% less energy than incandescent bulbs and last 25x longer.",
    category: "energy",
    effort: "medium",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 1.2,
    tip: "One-time switch, permanent savings. LEDs are the revenge glow-up of light bulbs 💡",
  },

  // Shopping
  {
    id: "no-new-clothes",
    title: "No new clothes this week",
    description: "Fast fashion is one of the most polluting industries. A week off helps.",
    category: "shopping",
    effort: "easy",
    impact: "high",
    estimatedWeeklySavingKgCO2e: 6.0,
    tip: "The fashion industry produces 10% of global CO2. Your 'just browsing' era has consequences 😬",
  },
  {
    id: "thrift-shopping",
    title: "Buy secondhand first",
    description: "Before buying new, check Vinted, Depop, or a local charity shop.",
    category: "shopping",
    effort: "easy",
    impact: "high",
    estimatedWeeklySavingKgCO2e: 5.5,
    tip: "Secondhand item = 96% less carbon than new equivalent. Thrifting is literally the move 🛍️",
  },
  {
    id: "consolidate-orders",
    title: "Batch online orders",
    description: "Instead of ordering every day, save up and place one bigger order.",
    category: "shopping",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 3.0,
    tip: "Each delivery = extra van on the road. Patience is a virtue AND an eco move",
  },
  {
    id: "repair-not-replace",
    title: "Repair something instead of replacing",
    description: "Sewing a button, fixing a zipper — tiny effort, avoids 6kg+ of new item emissions.",
    category: "shopping",
    effort: "medium",
    impact: "high",
    estimatedWeeklySavingKgCO2e: 4.0,
    tip: "YouTube + 20 minutes = most things are fixable. Being handy is actually kind of attractive btw",
  },
  {
    id: "borrow-not-buy",
    title: "Borrow or rent instead of buying",
    description: "Tools, books, party supplies — borrow from a friend or rent locally.",
    category: "shopping",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 2.0,
    tip: "You only need a drill for like 12 minutes total in your life. Just borrow one bestie 🔧",
  },
  {
    id: "reusable-bag",
    title: "Use reusable bags always",
    description: "Keep a tote bag in your everyday bag so you're never caught without one.",
    category: "shopping",
    effort: "easy",
    impact: "low",
    estimatedWeeklySavingKgCO2e: 0.3,
    tip: "Small but it stacks. Plus tote bags have main character energy 👜",
  },
  {
    id: "digital-gifts",
    title: "Gift experiences over things",
    description: "A dinner, a cinema trip, a workshop — experiences create memories not landfill.",
    category: "shopping",
    effort: "easy",
    impact: "medium",
    estimatedWeeklySavingKgCO2e: 2.5,
    tip: "Nobody remembers stuff they got. They remember the time you took them to that cooking class 🍝",
  },
] as const;
