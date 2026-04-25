"use client";


import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────
type Sign = {
  id: string;
  kh: string;
  en: string;
};

type Category = {
  key: string;
  code: string;
  label: { en: string; kh: string };
  color: string;
  count: number;
  signs: Sign[];
};

// ─── All 272 Signs Data ───────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    key: "r1", code: "PW03-R1", count: 40,
    label: { en: "Prohibitory Signs", kh: "សញ្ញាហាម" },
    color: "#e11d48",
    signs: [
      { id: "PW03-R1-01", kh: "ហាមបត់ឆ្វេង — ហាមយានជំនិះគ្រប់ប្រភេទ បត់ឆ្វេង", en: "No Turn Left — Prohibits all vehicles from turning left." },
      { id: "PW03-R1-02", kh: "ហាមបត់ស្តាំ — ហាមយានជំនិះគ្រប់ប្រភេទ បត់ស្តាំ", en: "No Turn Right — Prohibits all vehicles from turning right." },
      { id: "PW03-R1-03", kh: "ហាមបត់ត្រឡប់ក្រោយ — ហាមយានជំនិះគ្រប់ប្រភេទ បត់ត្រឡប់ក្រោយ", en: "No U-Turn — Prohibits all vehicles from making a U-turn." },
      { id: "PW03-R1-04", kh: "ហាមចូល — ហាមចូលចំពោះយានជំនិះគ្រប់ប្រភេទ", en: "No Entry — Prohibits entry for all types of vehicles." },
      { id: "PW03-R1-05", kh: "ផ្លូវបិទចំពោះយានជំនិះគ្រប់ប្រភេទ", en: "Closed For All Vehicles — Road is closed to all vehicle types." },
      { id: "PW03-R1-06", kh: "ផ្លូវបិទចំពោះអ្នកប្រើប្រាស់ផ្លូវ — ហាមយានជំនិះ និងថ្មើរជើង", en: "Closed For All Road Users — Prohibits both vehicles and pedestrians." },
      { id: "PW03-R1-07", kh: "កំណត់ទម្ងន់សរុប — ហាមយានដែលមានទម្ងន់សរុបលើសកំណត់", en: "Total Weight Limit — Prohibits vehicles exceeding the total weight shown." },
      { id: "PW03-R1-08", kh: "កំណត់ទម្ងន់លើភ្លៅនីមួយៗ — ហាមយានដែលមានទម្ងន់លើភ្លៅលើសកំណត់", en: "Weight Limit On One Axle — Prohibits vehicles exceeding the axle weight shown." },
      { id: "PW03-R1-09", kh: "កំណត់កម្ពស់ — ហាមយានដែលមានកម្ពស់សរុបលើសកំណត់", en: "Height Limit — Prohibits vehicles with total height exceeding the limit shown." },
      { id: "PW03-R1-10", kh: "កំណត់ទទឹង — ហាមយានដែលមានទទឹងសរុបលើសកំណត់", en: "Width Limit — Prohibits vehicles with total width exceeding the limit shown." },
      { id: "PW03-R1-11", kh: "កំណត់បណ្តោយ — ហាមយានដែលមានបណ្តោយសរុបលើសកំណត់", en: "Length Limit — Prohibits vehicles with total length exceeding the limit shown." },
      { id: "PW03-R1-12", kh: "ហាមចូលចំពោះទោចក្រយាន ទោចក្រយានយន្ត និងត្រីចក្រយាន", en: "No Entry For Bicycle, Motorcycle And Tricycle." },
      { id: "PW03-R1-13", kh: "ហាមចូលចំពោះទោចក្រយានយន្ត", en: "No Entry For Motorcycle." },
      { id: "PW03-R1-14", kh: "ហាមចូលចំពោះយានយន្តគ្រប់ប្រភេទ លើកលែងតែទោចក្រយានយន្ត", en: "No Entry For Motor Vehicles Except Motorcycles Without Side Carts." },
      { id: "PW03-R1-15", kh: "ហាមចូលចំពោះរថយន្តដឹកទំនិញធុនធំ (លើស ៣.៥ តោន)", en: "No Entry For Large-Sized Truck — Total weight exceeding 3.50 tons." },
      { id: "PW03-R1-16", kh: "ហាមចូលចំពោះរថយន្តដឹកអ្នកដំណើរធុនធំ (លើស ២០ នាក់)", en: "No Entry For Large-Sized Bus — Carrying more than 20 people including driver." },
      { id: "PW03-R1-17", kh: "ហាមចូលចំពោះយានយន្តគ្រប់ប្រភេទ", en: "No Entry For Motor Vehicles — All motor vehicles prohibited." },
      { id: "PW03-R1-18", kh: "ហាមចូលចំពោះទោចក្រយាន", en: "No Entry For Bicycle." },
      { id: "PW03-R1-19", kh: "ហាមចត — អាចឈប់ដាក់មនុស្ស ឬទំនិញឡើងចុះបានក្នុងរយៈពេលចាំបាច់", en: "No Parking — Drivers may stop briefly to load/unload passengers or goods." },
      { id: "PW03-R1-20", kh: "ហាមឈប់ — ហាមឈប់ចំពោះយានជំនិះគ្រប់ប្រភេទ", en: "No Stopping — Prohibits all vehicles from stopping at any time." },
      { id: "PW03-R1-21", kh: "ហាមចតចាប់ពីថ្ងៃទី ១ ដល់ថ្ងៃទី ១៥ — ផ្លាស់ប្តូរនៅម៉ោង ២១:០០", en: "No Parking From 1st To 15th Of The Month — Changeover at 21:00." },
      { id: "PW03-R1-22", kh: "ហាមចតចាប់ពីថ្ងៃទី ១៦ ដល់ថ្ងៃទី ៣១ — ផ្លាស់ប្តូរនៅម៉ោង ២១:០០", en: "No Parking From 16th To 31st Of The Month — Changeover at 21:00." },
      { id: "PW03-R1-23", kh: "ហាមចតថ្ងៃសេស — ផ្លាស់ប្តូរពីថ្ងៃសេសទៅថ្ងៃគូនៅម៉ោង ២១:០០", en: "No Parking On Odd Days — Changeover from odd to even days at 21:00." },
      { id: "PW03-R1-24", kh: "ហាមចតថ្ងៃគូ — ផ្លាស់ប្តូរពីថ្ងៃគូទៅថ្ងៃសេសនៅម៉ោង ២១:០០", en: "No Parking On Even Days — Changeover from even to odd days at 21:00." },
      { id: "PW03-R1-25", kh: "ហាមជែង — ហាមជែងចំពោះយានយន្ត លើកលែងតែទោចក្រយានយន្ត", en: "No Overtaking — Prohibits all motor vehicles except motorcycles." },
      { id: "PW03-R1-26", kh: "ចប់ការហាមជែង — ចប់ការហាមជែងចំពោះយានយន្តគ្រប់ប្រភេទ", en: "End Of No Overtaking — End of no-overtaking zone for all motor vehicles." },
      { id: "PW03-R1-27", kh: "ហាមជែងចំពោះរថយន្តដឹកទំនិញធុនធំ (លើស ៣.៥ តោន)", en: "No Overtaking For Large-Size Trucks — Total weight exceeding 3.5 tons." },
      { id: "PW03-R1-28", kh: "ចប់ការហាមជែងចំពោះរថយន្តដឹកទំនិញធុនធំ", en: "End Of No Overtaking For Large-Size Trucks." },
      { id: "PW03-R1-29", kh: "ហាមជែងចំពោះរថយន្តដឹកទំនិញធុនធំ ប្រហាក់ប្រហែលគ្នា", en: "No Overtaking For Similar Large-Size Trucks." },
      { id: "PW03-R1-30", kh: "ចប់ការហាមជែងចំពោះរថយន្តដឹកទំនិញធុនធំ ដូចគ្នា", en: "End Of No Overtaking For Similar Large-Size Trucks." },
      { id: "PW03-R1-31", kh: "ហាមស៊ីផ្លេ — លើកលែងតែករណីអាចមានគ្រោះថ្នាក់បន្ទាន់", en: "No Horn — Except in cases of immediate danger." },
      { id: "PW03-R1-32", kh: "ចប់ការហាមស៊ីផ្លេ — ចប់ការហាមស៊ីផ្លេចំពោះយានជំនិះគ្រប់ប្រភេទ", en: "End Of No Horn — End of no-horn zone for all vehicles." },
      { id: "PW03-R1-33", kh: "ហាមចូលចំពោះទោចក្រយានយន្តមានសណ្តោង", en: "No Entry For Motorcycle Drawn Vehicles — Motorcycles with trailers or carts." },
      { id: "PW03-R1-34", kh: "ហាមចូលចំពោះរទេះអូសទាញដោយសត្វ", en: "No Entry For Animal Drawn Vehicles." },
      { id: "PW03-R1-35", kh: "ហាមរុញ ឬ រុញរទេះចូល", en: "No Entry For Hand-Carts." },
      { id: "PW03-R1-36", kh: "ហាមចូលចំពោះយានយន្តកសិកម្ម", en: "No Entry For Agricultural Motor Vehicles." },
      { id: "PW03-R1-37", kh: "ហាមចូលចំពោះរថយន្តដឹកទំនិញធុនធំមានសណ្តោង", en: "No Entry For Combination Vehicles — Large trucks with trailers." },
      { id: "PW03-R1-38", kh: "ហាមទុកចន្លោះសុវត្ថិភាព តិចជាង ៧០ ម៉ែត្រ រវាងរថយន្តធុនតូច", en: "Do Not Keep Safety Distance Less Than 70m For Passenger Cars." },
      { id: "PW03-R1-39", kh: "ហាមទុកចន្លោះសុវត្ថិភាព តិចជាង ១០០ ម៉ែត្រ រវាងរថយន្តធុនធំ", en: "Do Not Keep Safety Distance Less Than 100m For Trucks." },
      { id: "PW03-R1-40", kh: "ហាមចូលចំពោះយានយន្តដឹកផលិតផលផ្ទុះ ឬងាយឆេះ", en: "No Entry For Vehicle Loading Inflammable Or Explosive Goods." },
      { id: "PW03-R1-41", kh: "កំណត់ល្បឿនអតិបរមា — ហាមបើកបរលើសល្បឿន (គ.ម/ម៉ោង) ដូចកំណត់", en: "Maximum Speed Limit — Prohibits driving over the speed shown (km/h)." },
      { id: "PW03-R1-42", kh: "ចប់ការកំណត់ល្បឿនអតិបរមា", en: "End Of Maximum Speed Limit." },
      { id: "PW03-R1-43", kh: "ឈប់នៅទីស្នាក់ការគយ — ត្រូវឈប់ ត្រួតពិនិត្យ និងបំពេញបែបបទ", en: "Stop At The Customs Office — All vehicles must stop for inspection." },
      { id: "PW03-R1-44", kh: "ឈប់នៅទីស្នាក់ការប៉ូលីស — យានស៊ីវិលគ្រប់ប្រភេទ", en: "Stop At The Police Station — All civilian vehicles must stop for inspection." },
      { id: "PW03-R1-45", kh: "ឈប់នៅទីស្នាក់ការអាវុធហត្ថ — យានកងកម្លាំងប្រដាប់អាវុធ", en: "Stop At The Military Police Station — Armed forces vehicles must stop." },
    ],
  },
  {
    key: "r2", code: "PW03-R2", count: 24,
    label: { en: "Mandatory Signs", kh: "សញ្ញាតម្រូវ" },
    color: "#2563eb",
    signs: [
      { id: "PW03-R2-01", kh: "តម្រូវដាក់ស្តាំ — តម្រូវអោយយានជំនិះគ្រប់ប្រភេទ បើកបរ ឬ វាងទៅស្តាំ", en: "Keep Right — All vehicles must drive or bypass to the right." },
      { id: "PW03-R2-02", kh: "តម្រូវដាក់ឆ្វេង — តម្រូវអោយយានជំនិះគ្រប់ប្រភេទ បើកបរ ឬ វាងទៅឆ្វេង", en: "Keep Left — All vehicles must drive or bypass to the left." },
      { id: "PW03-R2-03", kh: "តម្រូវបត់ស្តាំ នៅខាងមុខ — នៅត្រង់ផ្លូវប្រសព្វខាងមុខ", en: "Turn Right Ahead — All vehicles must turn right at the upcoming intersection." },
      { id: "PW03-R2-04", kh: "តម្រូវបត់ឆ្វេង នៅខាងមុខ — នៅត្រង់ផ្លូវប្រសព្វខាងមុខ", en: "Turn Left Ahead — All vehicles must turn left at the upcoming intersection." },
      { id: "PW03-R2-05", kh: "តម្រូវទៅមុខត្រង់ ឬ បត់ស្តាំ", en: "Go Straight Through Or Turn Right — At the intersection ahead." },
      { id: "PW03-R2-06", kh: "តម្រូវទៅមុខត្រង់ ឬ បត់ឆ្វេង", en: "Go Straight Through Or Turn Left — At the intersection ahead." },
      { id: "PW03-R2-07", kh: "តម្រូវបត់ស្តាំ — នៅខាងមុខផ្លាកសញ្ញា", en: "Turn Right — All vehicles must turn right in front of the sign." },
      { id: "PW03-R2-08", kh: "តម្រូវបត់ឆ្វេង — នៅខាងមុខផ្លាកសញ្ញា", en: "Turn Left — All vehicles must turn left in front of the sign." },
      { id: "PW03-R2-09", kh: "តម្រូវបត់ស្តាំ ឬ បត់ឆ្វេង — នៅត្រង់ផ្លូវប្រសព្វខាងមុខ", en: "Turn Left Or Right — At the intersection ahead." },
      { id: "PW03-R2-10", kh: "តម្រូវទៅមុខត្រង់ — នៅត្រង់ផ្លូវប្រសព្វខាងមុខ", en: "Straight Through Only — At the intersection ahead." },
      { id: "PW03-R2-11", kh: "ផ្លូវសម្រាប់រថយន្តដឹកអ្នកដំណើរ និងរថយន្តធុនតូច", en: "Compulsory Buses And Passenger Cars — Excluding commercial freight vehicles." },
      { id: "PW03-R2-12", kh: "ផ្លូវសម្រាប់រទេះអូសទាញដោយសត្វ — រទេះគោ ក្របី សេះ", en: "Animal Drawn Vehicle Carts Of All Form — Ox, buffalo, or horse carts only." },
      { id: "PW03-R2-13", kh: "ផ្លូវសម្រាប់ថ្មើរជើង — សម្រាប់តែថ្មើរជើង", en: "Compulsory Foot-Path — Reserved exclusively for pedestrians." },
      { id: "PW03-R2-14", kh: "ចប់ ផ្លូវសម្រាប់ថ្មើរជើង", en: "End Of Compulsory Foot-Path." },
      { id: "PW03-R2-15", kh: "ផ្លូវសម្រាប់ថ្មើរជើង និងទោចក្រយាន", en: "Compulsory Foot-Path And Bicycle Track — Shared path for pedestrians and bicycles." },
      { id: "PW03-R2-16", kh: "ចប់ ផ្លូវសម្រាប់ថ្មើរជើង និងទោចក្រយាន", en: "End Of Compulsory Foot-Path And Bicycle Track." },
      { id: "PW03-R2-17", kh: "កំណត់ល្បឿនអប្បបរមា — តម្រូវបើកបរក្នុងល្បឿន (គ.ម/ម៉ោង) អប្បបរមា", en: "Minimum Speed Limit — All vehicles must drive at minimum speed shown (km/h)." },
      { id: "PW03-R2-18", kh: "ចប់ ការកំណត់ល្បឿនអប្បបរមា", en: "End Of Minimum Speed Limit." },
      { id: "PW03-R2-19", kh: "ផ្លូវសម្រាប់រថយន្តដឹកអ្នកដំណើរ — សម្រាប់តែរថយន្តដឹកអ្នកដំណើរ", en: "Compulsory Large-Size Bus — Road reserved exclusively for large passenger buses." },
      { id: "PW03-R2-20", kh: "ចប់ ផ្លូវសម្រាប់រថយន្តដឹកអ្នកដំណើរ", en: "End Of Compulsory Large-Size Bus." },
      { id: "PW03-R2-21", kh: "ផ្លូវសម្រាប់ទោចក្រយាន — សម្រាប់តែទោចក្រយាន", en: "Compulsory Bicycle Track — Reserved exclusively for bicycles." },
      { id: "PW03-R2-22", kh: "ចប់ ផ្លូវសម្រាប់ទោចក្រយាន", en: "End Of Compulsory Bicycle Track." },
      { id: "PW03-R2-23", kh: "ប្រកាន់ស្តាំ — តម្រូវអ្នកបើកបរធ្វើចរាចរប្រកាន់ខាងស្តាំ", en: "Keep Right — Drivers must keep to the right side of the road." },
      { id: "PW03-R2-24", kh: "បន្ថយល្បឿន — តម្រូវអ្នកបើកបរបន្ថយល្បឿន", en: "Speed Reducing — All drivers must reduce their speed." },
    ],
  },
  {
    key: "r3", code: "PW03-R3", count: 10,
    label: { en: "Priority Signs", kh: "សញ្ញាអាទិភាព" },
    color: "#d97706",
    signs: [
      { id: "PW03-R3-01", kh: "ឈប់ដើម្បីផ្តល់សិទ្ធិអាទិភាពអោយគេ (នៅត្រង់ផ្លូវប្រសព្វ) — ត្រូវឈប់ ហើយបន្តដំណើរលុះត្រាផ្លូវទំនេរ", en: "Stop And Give Way (at Intersection) — Must stop; proceed only when road is clear." },
      { id: "PW03-R3-02", kh: "ផ្តល់សិទ្ធិអាទិភាពអោយគេ (នៅត្រង់ផ្លូវប្រសព្វ) — បន្ថយល្បឿន ឬ ឈប់រង់ចាំ", en: "Give Way (at Intersection) — Slow down; stop and wait if road is not clear." },
      { id: "PW03-R3-03", kh: "ផ្តល់សិទ្ធិអាទិភាពអោយគេ (នៅរង្វង់មូល) — ផ្តល់សិទ្ធិអោយយានក្នុងរង្វង់មូល", en: "Give Way (at Roundabout) — Give priority to vehicles already inside the roundabout." },
      { id: "PW03-R3-04", kh: "ផ្លូវមានសិទ្ធិ — ផ្លូវធំ មានផ្លូវតូចឆ្លងកាត់នៅខាងមុខ", en: "Priority Road (Priority At The First Junction) — Main road with minor road crossing ahead." },
      { id: "PW03-R3-05", kh: "ផ្លូវមានសិទ្ធិអាទិភាព — ផ្លូវមានសិទ្ធិអាទិភាពលើផ្លូវច្រើន", en: "Main Road — Priority over multiple intersecting roads ahead." },
      { id: "PW03-R3-06", kh: "ចប់ ផ្លូវមានសិទ្ធិអាទិភាព", en: "End Of Main Road — End of priority status for the main road." },
      { id: "PW03-R3-07", kh: "ផ្តល់សិទ្ធិអាទិភាពអោយយានមកពីទិសផ្ទុយ — ផ្លូវរួមតូចមួយជួរ", en: "Give Way To All Traffic From The Opposite Direction — Narrow one-lane road ahead." },
      { id: "PW03-R3-08", kh: "មានសិទ្ធិអាទិភាពលើយានមកពីទិសផ្ទុយ — ផ្លូវរួមតូចមួយជួរ", en: "Priority Over All Traffic From The Opposite Direction — Narrow one-lane road ahead." },
      { id: "PW03-R3-09", kh: "មានផ្លូវរថភ្លើងឆ្លងកាត់ (មួយខ្សែ) — ត្រូវទុកសិទ្ធិអាទិភាពអោយរថភ្លើង", en: "Railway Crossing (One Track) — Single track ahead; give priority to train." },
      { id: "PW03-R3-10", kh: "មានផ្លូវរថភ្លើងឆ្លងកាត់ (ពីរ ឬ ច្រើនខ្សែ) — ត្រូវទុកសិទ្ធិអាទិភាពអោយរថភ្លើង", en: "Railway Crossing (Two Or More Tracks) — Multiple tracks; give priority to train." },
    ],
  },
];

// ─── Warning Signs W1 (49) + W2 (11) ─────────────────────────────────────────
const WARNING_CATEGORIES: Category[] = [
  {
    key: "w1", code: "PW03-W1", count: 49,
    label: { en: "Warning Signs", kh: "សញ្ញាព្រមាន" },
    color: "#f59e0b",
    signs: [
      { id: "PW03-W1-01", kh: "គ្រោះថ្នាក់ផ្សេងៗ — ប្រើសំរាប់បញ្ជាក់គ្រោះថ្នាក់ដែលគ្មានចែងក្នុងសញ្ញាផ្សេង", en: "Dangers — Various hazards not specified in other danger signs." },
      { id: "PW03-W1-02", kh: "ផ្លូវកោងទៅស្តាំ — ប្រុងប្រយ័ត្ន មានផ្លូវកោងទៅស្តាំ", en: "Right Bend — Caution: right bend in the road ahead." },
      { id: "PW03-W1-03", kh: "ផ្លូវកោងទៅឆ្វេង — ប្រុងប្រយ័ត្ន មានផ្លូវកោងទៅឆ្វេង", en: "Left Bend — Caution: left bend in the road ahead." },
      { id: "PW03-W1-04", kh: "ផ្លូវកោងគ្រោះថ្នាក់ (កោងទៅស្តាំ ហើយទៅឆ្វេង)", en: "Double Bend To Right And To Left — Right then left bend ahead." },
      { id: "PW03-W1-05", kh: "ផ្លូវកោងគ្រោះថ្នាក់ (កោងទៅឆ្វេង ហើយទៅស្តាំ)", en: "Double Bend To Left And To Right — Left then right bend ahead." },
      { id: "PW03-W1-06", kh: "ផ្លូវកោងចុះឡើង — ប្រុងប្រយ័ត្ន មានផ្លូវកោងចុះឡើង", en: "Winding Road — Caution: winding road ahead." },
      { id: "PW03-W1-07", kh: "មានផ្លូវបំបែកទៅខាងស្តាំ", en: "Road Junction On The Right — Junction on the right ahead." },
      { id: "PW03-W1-08", kh: "មានផ្លូវបំបែកទៅខាងឆ្វេង", en: "Road Junction On The Left — Junction on the left ahead." },
      { id: "PW03-W1-09", kh: "ផ្លូវបំបែករាង Y", en: "Y-Intersection Ahead — Y-shaped intersection ahead." },
      { id: "PW03-W1-10", kh: "ផ្លូវបំបែករាង T", en: "T-Intersection Ahead — T-shaped intersection ahead." },
      { id: "PW03-W1-11", kh: "ផ្លូវបំបែកបែរទៅខាងឆ្វេង", en: "Road Junction On The Left — Junction turning to the left ahead." },
      { id: "PW03-W1-12", kh: "ផ្លូវប្រសព្វបែរទៅខាងស្តាំ", en: "Road Junction On The Right — Junction turning to the right ahead." },
      { id: "PW03-W1-13", kh: "ផ្លូវបំបែកបែរទៅខាងស្តាំ រួចបំបែកបែរទៅខាងឆ្វេង", en: "Staggered Junction, Right Turn First — Right then left staggered junction." },
      { id: "PW03-W1-14", kh: "ផ្លូវបំបែកបែរទៅខាងឆ្វេង រួចបំបែកបែរទៅខាងស្តាំ", en: "Staggered Junction, Left Turn First — Left then right staggered junction." },
      { id: "PW03-W1-15", kh: "ផ្លូវខ្វែងប៉ុនគ្នា — ផ្តល់សិទ្ធិអាទិភាពអោយអ្នកខាងស្តាំដៃ", en: "Cross Road (Priority On The Right Hand Side) — Give priority to vehicles from the right." },
      { id: "PW03-W1-16", kh: "រង្វង់មូល — ផ្តល់សិទ្ធិអាទិភាពអោយអ្នកក្នុងរង្វង់មូល", en: "Round About — Give priority to vehicles already inside the roundabout." },
      { id: "PW03-W1-17", kh: "ផ្លូវមានចរាចរពីរទិស", en: "Two-Way Traffic Zone — Two-way traffic zone ahead." },
      { id: "PW03-W1-18", kh: "ផ្លូវរួមតូច", en: "Carriage Way Narrows — Road narrows ahead." },
      { id: "PW03-W1-19", kh: "ផ្លូវរួមតូចនៅខាងស្តាំ", en: "Carriage Way Narrows On RHS — Road narrows on the right-hand side." },
      { id: "PW03-W1-20", kh: "ផ្លូវរួមតូចនៅខាងឆ្វេង", en: "Carriage Way Narrows On LHS — Road narrows on the left-hand side." },
      { id: "PW03-W1-21", kh: "ផ្លូវកែងបត់ស្តាំ", en: "Right Turn — Sharp right turn ahead." },
      { id: "PW03-W1-22", kh: "ផ្លូវកែងបត់ឆ្វេង", en: "Left Turn — Sharp left turn ahead." },
      { id: "PW03-W1-23", kh: "ផ្លូវកែងបត់ស្តាំ រួចកែងបត់ឆ្វេង", en: "Right Turn And Left Turn — Sharp right then sharp left turn ahead." },
      { id: "PW03-W1-24", kh: "ផ្លូវកែងបត់ឆ្វេង រួចកែងបត់ស្តាំ", en: "Left Turn And Right Turn — Sharp left then sharp right turn ahead." },
      { id: "PW03-W1-25", kh: "ផ្លូវបត់ស្តាំមានផ្លូវរថភ្លើងឆ្លងកាត់", en: "Railway Crossing On Right Road — Railway crossing on the road turning right." },
      { id: "PW03-W1-26", kh: "ផ្លូវបត់ឆ្វេងមានផ្លូវរថភ្លើងឆ្លងកាត់", en: "Railway Crossing On Left Road — Railway crossing on the road turning left." },
      { id: "PW03-W1-27", kh: "មានផ្លូវរថភ្លើងឆ្លងកាត់ (មានរបាំង)", en: "Railway Crossing With Gates — Railway crossing with gates/barriers ahead." },
      { id: "PW03-W1-28", kh: "មានផ្លូវរថភ្លើងឆ្លងកាត់ (គ្មានរបាំង)", en: "Railway Crossing Without Gates — Railway crossing without gates/barriers ahead." },
      { id: "PW03-W1-29", kh: "ផ្លូវឡើងចំណោត", en: "Steep Ascent — Steep ascent ahead." },
      { id: "PW03-W1-30", kh: "ផ្លូវចុះចំណោត", en: "Steep Descent — Steep descent ahead." },
      { id: "PW03-W1-31", kh: "ផ្លូវមានទួល", en: "Road Hump — Road hump ahead." },
      { id: "PW03-W1-32", kh: "ផ្លូវរលាក់", en: "Bumpy Road — Bumpy road ahead." },
      { id: "PW03-W1-33", kh: "មានកុមារឆ្លងកាត់", en: "Children Crossing — Children crossing ahead." },
      { id: "PW03-W1-34", kh: "មានថ្មើរជើងឆ្លងកាត់", en: "Pedestrian Crossing — Pedestrians crossing ahead." },
      { id: "PW03-W1-35", kh: "មានមនុស្សពិការឆ្លងកាត់", en: "Disabled People Crossing Ahead." },
      { id: "PW03-W1-36", kh: "មានសត្វពាហនៈឆ្លងកាត់", en: "Animals Crossing — Animals crossing ahead." },
      { id: "PW03-W1-37", kh: "សត្វព្រៃឆ្លងកាត់", en: "Wild Animals Crossing — Frequent wild animals crossing ahead." },
      { id: "PW03-W1-38", kh: "ផ្លូវរអិល — ពិសេសនៅពេលភ្លៀង", en: "Slippery Road — Slippery road ahead, especially when raining." },
      { id: "PW03-W1-39", kh: "មានថ្មធ្លាក់ — ថ្មធ្លាក់ ឬ ដុំថ្មលើទ្រូងផ្លូវ", en: "Falling Rocks — Falling rocks or rocks on the road ahead." },
      { id: "PW03-W1-40", kh: "មានថ្មខ្ទាត — ដុំថ្មក្រាលលើទ្រូងផ្លូវ", en: "Loose Stones — Loose stones on the road ahead." },
      { id: "PW03-W1-41", kh: "មានខ្យល់បក់ខ្លាំង", en: "Cross Wind Caution — Strong crosswinds ahead." },
      { id: "PW03-W1-42", kh: "មានភ្លើងស្តុប — ភ្លើងសញ្ញាចរាចរ", en: "Traffic Signal Lights — Traffic signal lights (stoplights) ahead." },
      { id: "PW03-W1-43", kh: "មានផ្លាកសញ្ញា ឈប់ដើម្បីផ្តល់សិទ្ធិអាទិភាពអោយគេ", en: "Stop Sign Ahead — Stop sign at the intersection ahead." },
      { id: "PW03-W1-44", kh: "មានផ្លាកសញ្ញា ផ្តល់សិទ្ធិអាទិភាពអោយគេ", en: "Give Way Sign Ahead — Give Way sign at the intersection ahead." },
      { id: "PW03-W1-45", kh: "ទ្រូងផ្លូវបែកជាពីរ", en: "Divided Road — Divided road ahead." },
      { id: "PW03-W1-46", kh: "ចប់ ទ្រូងផ្លូវបែកជាពីរ", en: "End Divided Road — End of divided road ahead." },
      { id: "PW03-W1-47", kh: "ផ្លូវមានយន្តហោះ ហោះទាបពីលើ", en: "Low Flying Aircraft — Low-flying aircraft crossing overhead." },
      { id: "PW03-W1-48", kh: "ទោចក្រយានឆ្លងកាត់", en: "Bicycle Crossing — Bicycles crossing ahead." },
      { id: "PW03-W1-49", kh: "ផ្លូវមាត់ទឹក — ចុងផ្លូវជាប់មាត់ទឹក", en: "Quay Side Or River Bank — Road ends at a quay side or river bank." },
    ],
  },
  {
    key: "w2", code: "PW03-W2", count: 11,
    label: { en: "Temporary / Work Zone Signs", kh: "សញ្ញាការដ្ឋាន" },
    color: "#ea580c",
    signs: [
      { id: "PW03-W2-01", kh: "មានការដ្ឋាន — ប្រុងប្រយ័ត្ន មានការដ្ឋាននៅខាងមុខ", en: "Road Works Ahead — Caution: road works ahead." },
      { id: "PW03-W2-02", kh: "ការដ្ឋាន — ចាប់ផ្តើមពីផ្លាកសញ្ញានេះទៅ", en: "Road Works — Road works starting from this sign onwards." },
      { id: "PW03-W2-03", kh: "ផ្លូវមានថ្មខ្ទាត — ចាប់ពីផ្លាកសញ្ញានេះទៅ", en: "Loose Stones — Loose stones on road surface from this sign onwards." },
      { id: "PW03-W2-04", kh: "ចប់ ការដ្ឋាន", en: "End Road Works — End of the road works." },
      { id: "PW03-W2-05", kh: "ផ្លូវវាងទៅខាងស្តាំ — វាងតាមសញ្ញាព្រួញ ទៅស្តាំ", en: "Detour To The Right — Detour to the right following the arrow." },
      { id: "PW03-W2-06", kh: "ផ្លូវវាងទៅខាងឆ្វេង — វាងតាមសញ្ញាព្រួញ ទៅឆ្វេង", en: "Detour To The Left — Detour to the left following the arrow." },
      { id: "PW03-W2-07", kh: "បង្គោលរាងសោជី — ប្រើជារបាំងការពារបរិវេណការដ្ឋាន", en: "Traffic Cone — Protective barriers around road works or necessary areas." },
      { id: "PW03-W2-08", kh: "សញ្ញាព្រួញបង្វែរទិស — ប្តូរទិសទៅតាមមុខព្រួញ", en: "Direction To Be Followed — Change direction according to the arrow." },
      { id: "PW03-W2-09", kh: "សញ្ញាឈប់ — ឈប់នៅពីមុខផ្លាកសញ្ញា ដែលកាន់ដោយភ្នាក់ងារការដ្ឋាន", en: "Stop Sign — Stop in front of the sign held by a road worker." },
      { id: "PW03-W2-10", kh: "សញ្ញាបើកផ្លូវ — អ្នកបើកបរ បន្តដំណើរ", en: "Go Sign — Signal drivers to proceed." },
      { id: "PW03-W2-11", kh: "ទង់ក្រហម — ឈប់នៅមុខភ្នាក់ងារការដ្ឋាន ដែលកាន់ទង់ក្រហម", en: "Red Flag — Stop in front of road worker holding red flag horizontally." },
    ],
  },
];

// ─── Guide Signs G1-G4 (55) ───────────────────────────────────────────────────
const GUIDE_CATEGORIES: Category[] = [
  {
    key: "g", code: "PW03-G1–G4", count: 55,
    label: { en: "Guide & Informative Signs", kh: "សញ្ញាណែនាំ និងព័ត៌មាន" },
    color: "#16a34a",
    signs: [
      { id: "PW03-G1-01", kh: "សញ្ញាបង្ហាញទិសដៅទៅខេត្ត ក្រុង (មានរង្វង់មូល)", en: "Guide Sign To Cities Or Provinces (At Roundabout)." },
      { id: "PW03-G1-02", kh: "សញ្ញាបង្ហាញទិសដៅទៅខេត្ត ក្រុង (គ្មានរង្វង់មូល)", en: "Guide Sign To Cities Or Provinces (At Junction)." },
      { id: "PW03-G1-03", kh: "សញ្ញាបង្ហាញទិសដៅទៅតំបន់ផ្សេងៗ (មានរង្វង់មូល)", en: "Guide Sign To Other Places (At Roundabout) — Districts or communes." },
      { id: "PW03-G1-04", kh: "សញ្ញាបង្ហាញទិសដៅទៅតំបន់ផ្សេងៗ (គ្មានរង្វង់មូល)", en: "Guide Sign To Other Places (At Junction) — Districts or communes." },
      { id: "PW03-G1-05", kh: "សញ្ញាបង្ហាញទិសដៅផ្សេងៗ (១) — ព្យួរនឹងបង្គោលរបារ លើគន្លងផ្លូវ", en: "Guide Sign To Other Places (1) — Hung on gantry over traffic lanes." },
      { id: "PW03-G1-06", kh: "សញ្ញាបង្ហាញទិសដៅផ្សេងៗ (២) — ដាក់នៅខាងស្តាំដៃ", en: "Guide Sign To Other Places (2) — Placed on the right-hand side." },
      { id: "PW03-G2-01", kh: "ចូលទីប្រជុំជន — ចូលមកដល់ទីប្រជុំជន", en: "Enter Agglomeration — Entering a built-up area or town center." },
      { id: "PW03-G2-02", kh: "ចប់ ទីប្រជុំជន — ចប់ ទីប្រជុំជន", en: "End Agglomeration — Leaving a built-up area or town center." },
      { id: "PW03-G2-03", kh: "ដល់ ព្រំប្រទល់ ខេត្ត ស្រុក ឬ ឃុំ", en: "Provincial, District Or Commune Boundary — Entering boundary." },
      { id: "PW03-G2-04", kh: "ចប់ព្រំប្រទល់ ខេត្ត ស្រុក ឬ ឃុំ", en: "End Provincial, District Or Commune Boundary." },
      { id: "PW03-G3-01", kh: "មហាវិថី ព្រះនរោត្តម — ឈ្មោះមហាវិថី", en: "Preah Norodom Boulevard — Boulevard name sign." },
      { id: "PW03-G3-02", kh: "វិថី ព្រះត្រសក់ផ្អែម — ឈ្មោះវិថី", en: "Preah Trasak Paem Street — Street name sign." },
      { id: "PW03-G3-03", kh: "ភូមិវិថី ក្រមួនស — ឈ្មោះភូមិវិថី", en: "Kramuon Sar Avenue — Avenue name sign." },
      { id: "PW03-G3-04", kh: "ផ្លូវលេខ ១១៣ — លេខផ្លូវ", en: "Street No. 113 — Street number sign." },
      { id: "PW03-G3-05", kh: "ផ្លូវអាស៊ានលេខ ១១ — ផ្លូវអាស៊ានកាត់តាមកម្ពុជា", en: "ASEAN Highway 11 — ASEAN Highway number through Cambodia." },
      { id: "PW03-G4-01", kh: "កន្លែងចតយានជំនិះ — ទីកន្លែងអនុញ្ញាតអោយចត", en: "Parking Area — Authorized parking area for vehicles." },
      { id: "PW03-G4-02", kh: "កន្លែងចតយានជំនិះ បង់ប្រាក់ — ចតបង់ប្រាក់", en: "Pay Parking Area — Authorized parking area where payment is required." },
      { id: "PW03-G4-03", kh: "កន្លែងថ្មើរជើង ឆ្លងកាត់", en: "Pedestrian Crossing Area — Designated area for pedestrians to cross." },
      { id: "PW03-G4-04", kh: "កន្លែងមានទួល — ទួលកាត់ទទឹងផ្លូវ", en: "Hump Area — Speed hump across the road." },
      { id: "PW03-G4-05", kh: "កំពង់ចម្លង (សាឡាង) — ទីកន្លែងមានកំពង់ចម្លង", en: "Ferry — Ferry crossing location." },
      { id: "PW03-G4-06", kh: "កន្លែងសង្គ្រោះបន្ទាន់", en: "First Aid — First aid station location." },
      { id: "PW03-G4-07", kh: "មន្ទីរពេទ្យ", en: "Hospital — Hospital location." },
      { id: "PW03-G4-08", kh: "កន្លែងទូរស័ព្ទ — សេវាទូរស័ព្ទសាធារណៈ", en: "Telephone — Public telephone service location." },
      { id: "PW03-G4-09", kh: "កន្លែងផ្តល់ព័ត៌មាន — ពិសេសអ្នកទេសចរណ៍", en: "Official Tourist Information — Official information center." },
      { id: "PW03-G4-10", kh: "ស្ថានីយ៍ចាក់ប្រេងឥន្ធនៈ", en: "Filling Station — Fuel filling station location." },
      { id: "PW03-G4-11", kh: "ស្ថានីយ៍ចាក់ប្រេងឥន្ធនៈ និងជួសជុល", en: "Filling Station And Repair — Fuel station and vehicle repair." },
      { id: "PW03-G4-12", kh: "យានដ្ឋាន ជួសជុល", en: "Garage Station — Vehicle repair garage location." },
      { id: "PW03-G4-13", kh: "អាហារដ្ឋាន", en: "Restaurant — Restaurant location." },
      { id: "PW03-G4-14", kh: "ភេសជ្ជៈដ្ឋាន", en: "Cafeteria — Cafeteria location." },
      { id: "PW03-G4-15", kh: "សណ្ឋាគារ ឬ ផ្ទះសំណាក់", en: "Hotel, Guest House — Hotel or guest house location." },
      { id: "PW03-G4-16", kh: "កន្លែងសំរាកកំសាន្ត", en: "Rest Area — Rest area location." },
      { id: "PW03-G4-17", kh: "ព្រលានយន្តហោះ", en: "Airport — Airport location." },
      { id: "PW03-G4-18", kh: "កន្លែងរំកិលទូកចុះទឹក", en: "Boat Ramp — Boat ramp location." },
      { id: "PW03-G4-19", kh: "កន្លែងបោះតង់កំសាន្ត", en: "Camping Area — Camping area." },
      { id: "PW03-G4-20", kh: "កន្លែងចតរ៉ឺម៉កចល័តកំសាន្ត", en: "Caravan Park Or Site — Caravan park or site." },
      { id: "PW03-G4-21", kh: "កន្លែងបោះតង់ និងចតរ៉ឺម៉កចល័តកំសាន្ត", en: "Caravan Park And Camping Area." },
      { id: "PW03-G4-22", kh: "ចំណតរថយន្តតាក់ស៊ី", en: "Taxis Station — Taxi station location." },
      { id: "PW03-G4-23", kh: "បង្គន់អនាម័យ", en: "Toilets — Toilet location." },
      { id: "PW03-G4-24", kh: "ទឹកបរិភោគ", en: "Drinking Water — Drinking water location." },
      { id: "PW03-G4-25", kh: "កន្លែងមានធុងសំរាម", en: "Litter Bin — Litter bin location." },
      { id: "PW03-G4-26", kh: "អនុញ្ញាតអោយជិះទោចក្រយានទន្ទឹមគ្នា", en: "Abreast Traveling Permitted For Bicycle — Bicycles may travel side-by-side." },
      { id: "PW03-G4-27", kh: "ផ្លូវទាល់ខាងមុខ", en: "No Through Road — Dead end ahead." },
      { id: "PW03-G4-28", kh: "ផ្លូវបត់ទៅស្តាំជាផ្លូវទាល់", en: "No Through Road On Right Road — Right road is a dead end." },
      { id: "PW03-G4-29", kh: "ផ្លូវបត់ទៅឆ្វេងជាផ្លូវទាល់", en: "No Through Road On Left Road — Left road is a dead end." },
      { id: "PW03-G4-30", kh: "យានបថ — ចាប់ផ្តើមចូលផ្លូវយានបថ", en: "Motor Way — Beginning of a motorway." },
      { id: "PW03-G4-31", kh: "ចប់ យានបថ", en: "End Of Motor Way — End of the motorway." },
      { id: "PW03-G4-32", kh: "ចំណែកផ្លូវធ្វើចរាចរ — ចំណែកផ្លូវតាមប្រភេទអ្នកប្រើ", en: "Compulsory Lanes — Specific lanes for each type of road user." },
      { id: "PW03-G4-33", kh: "គន្លងផ្លូវ បង្រួមជាពីរ (ទៅខាងស្តាំ) — គន្លងឆ្វេងរួមចូលកណ្តាល", en: "3 Lanes Reduce In 2 Lanes — Left lane merging into middle lane." },
      { id: "PW03-G4-34", kh: "គន្លងផ្លូវ បង្រួមជាពីរ (ទៅខាងឆ្វេង) — គន្លងស្តាំរួមចូលកណ្តាល", en: "3 Lanes Reduce In 2 Lanes — Right lane merging into middle lane." },
      { id: "PW03-G4-35", kh: "ផ្លូវវាងបត់ឆ្វេង — ហាមបត់ឆ្វេងនៅផ្លូវប្រសព្វខាងមុខ", en: "Detour For Turning Left — Left turns prohibited at intersection ahead." },
      { id: "PW03-G4-36", kh: "ផ្លូវវាងចំពោះយានដែលមានកម្ពស់សរុបលើស ៣.៣ម", en: "Detour For Vehicle Having Overall Height Exceeding The Specified Height." },
      { id: "PW03-G4-37", kh: "គន្លងផ្លូវត្រូវធ្វើចរាចរ — ទិសដៅបើកបរតាមបញ្ជាព្រួញ (១)", en: "Arrow Direction Exclusive Lane (1) — Follow arrows when approaching intersection." },
      { id: "PW03-G4-38", kh: "គន្លងផ្លូវត្រូវធ្វើចរាចរ — ទិសដៅបើកបរតាមបញ្ជាព្រួញ (២)", en: "Arrow Direction Exclusive Lane (2) — Follow arrows when approaching intersection." },
      { id: "PW03-G4-39", kh: "ផ្លូវឯកទិស — អនុញ្ញាតអោយធ្វើចរាចរបានតែមួយទិស", en: "One Way Traffic — Traffic allowed only in the direction of the arrow." },
      { id: "PW03-G4-40", kh: "ប្រយ័ត្នភ្លើងឆេះព្រៃ — មានព្រៃដែលល្មមងាយឆេះ", en: "Forest Fire Warning Sign — Fire-prone forest area nearby; be careful." },
    ],
  },
];

// ─── Supplementary, Delineators, Markings, Signals, Officer ──────────────────
const OTHER_CATEGORIES: Category[] = [
  {
    key: "s1", code: "PW03-S1", count: 25,
    label: { en: "Supplementary Plates", kh: "ផ្លាកសញ្ញាបន្ថែម" },
    color: "#6366f1",
    signs: [
      { id: "PW03-S1-01", kh: "ទោចក្រយាន — សំគាល់ទោចក្រយាន", en: "Bicycle — Identifies bicycles." },
      { id: "PW03-S1-02", kh: "ទោចក្រយានយន្ត — សំគាល់ទោចក្រយានយន្ត", en: "Motorcycle — Identifies motorcycles." },
      { id: "PW03-S1-03", kh: "ទោចក្រយានមានរ៉ឺម៉កសណ្តោង", en: "Motorcycle Drawn Vehicles — Vehicles with attached trailer." },
      { id: "PW03-S1-04", kh: "រថយន្តធុនតូច — ផ្ទុកមនុស្សមិនលើស ៩ នាក់ ឬ ទំនិញមិនលើស ៣.៥ តោន", en: "Motor Vehicles — Carry ≤9 people or goods ≤3.5 tons." },
      { id: "PW03-S1-05", kh: "រថយន្តដឹកអ្នកដំណើរធុនធំ — ផ្ទុកអ្នកដំណើរយ៉ាងតិច ២០ នាក់", en: "Large Sized Bus — Carry at least 20 people including driver." },
      { id: "PW03-S1-06", kh: "រថយន្តដឹកទំនិញធុនធំ — ទំងន់សរុបលើស ៣.៥០ តោន", en: "Large Sized Truck — Total weight exceeding 3.50 tons." },
      { id: "PW03-S1-07", kh: "យានយន្តកសិកម្ម", en: "Agricultural Motor Vehicles — Agricultural vehicles." },
      { id: "PW03-S1-08", kh: "រទេះអូសទាញដោយសត្វ", en: "Animal Drawn Vehicles — Carts drawn by animals." },
      { id: "PW03-S1-09", kh: "យានមានទម្ងន់ផ្ទុកលើភ្លៅនីមួយៗ លើស ២ តោន", en: "Vehicles Having Over All Weight On Axle Exceeding The Specified Weight." },
      { id: "PW03-S1-10", kh: "រថយន្តដឹកទំនិញធុនធំ ដែលមានបណ្តោយលើស ១០ម", en: "Large Size Truck Having Over All Length Exceeding The Specified Length." },
      { id: "PW03-S1-11", kh: "យានដែលមានទទឹងលើស ២ម", en: "Vehicles Having Over All Width Exceeding The Specified Width." },
      { id: "PW03-S1-12", kh: "យានដែលមានកម្ពស់លើស ៣.៥ម", en: "Vehicles Having Over All Height Exceeding The Specified Height." },
      { id: "PW03-S1-13", kh: "ទៅខាងស្តាំដៃ — ទីតាំងហាមចតពីផ្លាកសញ្ញាទៅខាងស្តាំដៃ", en: "To The Right Hand Side — No-parking zone extending to the right." },
      { id: "PW03-S1-14", kh: "ទៅខាងស្តាំ និងខាងឆ្វេងដៃ", en: "To The Right And Left Hand Side — No-parking zone extending both sides." },
      { id: "PW03-S1-15", kh: "ទៅខាងឆ្វេងដៃ — ទីតាំងហាមចតពីផ្លាកសញ្ញាទៅខាងឆ្វេងដៃ", en: "To The Left Hand Side — No-parking zone extending to the left." },
      { id: "PW03-S1-16", kh: "ទៅខាងមុខ — ទីតាំងហាមចតចាប់ពីផ្លាកសញ្ញាទៅមុខ", en: "Forward — No-parking zone starting from sign and extending forward." },
      { id: "PW03-S1-17", kh: "ទៅខាងមុខ និងមកខាងក្រោយ", en: "Forward And Backward — No-parking zone extending both forward and backward." },
      { id: "PW03-S1-18", kh: "មកខាងក្រោយ — ទីតាំងហាមចតចាប់ពីផ្លាកសញ្ញាមកខាងក្រោយ", en: "Backward — No-parking zone extending backward from sign." },
      { id: "PW03-S1-19", kh: "ប្រយ័ត្ន! រថភ្លើងឆ្លងកាត់", en: "Beware Of Train — Railway crossing ahead." },
      { id: "PW03-S1-20", kh: "ច្រកចេញចូលរោងចក្រ", en: "Factory's Gate — Factory entrance ahead." },
      { id: "PW03-S1-21", kh: "បង្ហាញទិសដៅ ផ្លូវមានសិទ្ធិ (១)", en: "Direction Of Priority Road (1) — Right-turn direction of main priority road." },
      { id: "PW03-S1-22", kh: "បង្ហាញទិសដៅ ផ្លូវមានសិទ្ធិ (២)", en: "Direction Of Priority Road (2) — Direction of main priority road." },
      { id: "PW03-S1-23", kh: "បង្ហាញចម្ងាយ", en: "Distance Identification — Additional information regarding distance." },
      { id: "PW03-S1-24", kh: "បង្ហាញពេលវេលា", en: "Time Identification — Additional information regarding time." },
      { id: "PW03-S1-25", kh: "យានផ្ទុកផលិតផលងាយឆេះ", en: "Vehicles Loading Inflammable Goods — Vehicles carrying inflammable products." },
    ],
  },
  {
    key: "p1", code: "PW03-P1", count: 10,
    label: { en: "Delineators & Posts", kh: "បង្គោលសញ្ញា" },
    color: "#8b5cf6",
    signs: [
      { id: "PW03-P1-01", kh: "បង្គោលសញ្ញារាងកោង ឬ តំបងផ្លូវ", en: "Delineator Post — Shows curve or keeps drivers from veering off road." },
      { id: "PW03-P1-02", kh: "បង្គោលសញ្ញារាងកោង (កោងគ្រោះថ្នាក់)", en: "Guide Post (At Dangerous Curve) — Dangerous curve with ascent, descent, or cliffside." },
      { id: "PW03-P1-03", kh: "សញ្ញាលើបាដានផ្លូវកោងទៅស្តាំ", en: "Lateral Shift Marker (To Right) — Right bend in the road." },
      { id: "PW03-P1-04", kh: "សញ្ញាលើបាដានផ្លូវកោងទៅឆ្វេង", en: "Lateral Shift Marker (To Left) — Left bend in the road." },
      { id: "PW03-P1-05", kh: "សញ្ញាបង្ហាញឧបសគ្គ នៅខាងស្តាំ", en: "Object Marker (On The Right) — Obstacle on the right side." },
      { id: "PW03-P1-06", kh: "សញ្ញាបង្ហាញឧបសគ្គ នៅលើទ្រូងផ្លូវ", en: "Object Marker (At Center) — Obstacle on the road surface." },
      { id: "PW03-P1-07", kh: "សញ្ញាបង្ហាញឧបសគ្គ នៅខាងឆ្វេង", en: "Object Marker (On The Left) — Obstacle on the left side." },
      { id: "PW03-P1-08", kh: "បង្គោលសញ្ញាផ្លូវរថភ្លើងឆ្លងកាត់ — ១៥០ម ១០០ម ៥០ម", en: "Railway Crossing Post — 150m, 100m, or 50m ahead." },
      { id: "PW03-P1-09", kh: "បង្គោលគីឡូម៉ែត្រ (សំរាប់ចន្លោះ ១០គ.ម)", en: "Kilometer Post (For 10Km Interval) — Distance to important areas." },
      { id: "PW03-P1-10", kh: "បង្គោលគីឡូម៉ែត្រ (សំរាប់ចន្លោះ ១គ.ម)", en: "Kilometer Post (For 1 Km Interval) — Placed every 1km from Phnom Penh." },
    ],
  },
  {
    key: "m", code: "PW03-M1–M4", count: 32,
    label: { en: "Road Markings", kh: "គំនូសសញ្ញាលើផ្លូវ" },
    color: "#0891b2",
    signs: [
      { id: "PW03-M1-01", kh: "គំនូសសញ្ញាឈប់ (ទោល) — គំនូសទោលជាប់ពណ៌ស កាត់ទទឹងទ្រូងផ្លូវ", en: "Stop Line (Single Solid) — Single solid white line across the road." },
      { id: "PW03-M1-02", kh: "គំនូសសញ្ញាឈប់ (ភ្លោះ) — គំនូសភ្លោះជាប់ពណ៌ស កាត់ទទឹងទ្រូងផ្លូវ", en: "Stop Line (Double Solid) — Double solid white line across the road." },
      { id: "PW03-M1-03", kh: "គំនូសសញ្ញាផ្តល់សិទ្ធិអាទិភាព (ភ្លោះ) — គំនូសភ្លោះដាច់ៗពណ៌ស", en: "Give Way Line (Double Broken) — Double broken white line across the road." },
      { id: "PW03-M1-04", kh: "គំនូសសញ្ញាផ្តល់សិទ្ធិអាទិភាព (ទោល) — គំនូសទោលដាច់ៗពណ៌ស", en: "Give Way Line (Single Broken) — Single broken white line across the road." },
      { id: "PW03-M2-01", kh: "គំនូសសញ្ញាទោល ដាច់ៗ បែងចែកទិសចរាចរ — ទោលដាច់ៗពណ៌លឿង", en: "Single Yellow Broken Line — Separates two opposite traffic directions." },
      { id: "PW03-M2-02", kh: "គំនូសសញ្ញាទោល ជាប់ បែងចែកទិសចរាចរ — ទោលជាប់ពណ៌លឿង ហាមជាន់", en: "Single Yellow Solid Line — Separates two opposite directions; no crossing." },
      { id: "PW03-M2-03", kh: "គំនូសសញ្ញាភ្លោះ ជាប់ បែងចែកទិសចរាចរ — ភ្លោះជាប់ពណ៌លឿង ហាមជាន់", en: "Double Yellow Solid Line — Separates two opposite directions; no crossing." },
      { id: "PW03-M2-04", kh: "គំនូសសញ្ញាភ្លោះ បែងចែកទិសចរាចរ (មានគំនូសដាច់នៅខាងឆ្វេង)", en: "Double Yellow Combination Line — Solid right, broken left." },
      { id: "PW03-M2-05", kh: "គំនូសសញ្ញាភ្លោះ បែងចែកទិសចរាចរ (មានគំនូសដាច់នៅខាងស្តាំ)", en: "Double Yellow Combination Line — Solid left, broken right." },
      { id: "PW03-M2-06", kh: "គំនូសសញ្ញាដាច់ៗ បែងចែកគន្លងផ្លូវ — ទោលដាច់ៗពណ៌ស", en: "Single White Broken Line — Separates traffic lanes." },
      { id: "PW03-M2-07", kh: "គំនូសសញ្ញាជាប់ បែងចែកគន្លងផ្លូវ — ទោលជាប់ពណ៌ស នៅជិតផ្លូវប្រសព្វ", en: "White Single Solid Line — Separates lanes near intersections." },
      { id: "PW03-M2-08", kh: "គំនូសសញ្ញា កំណត់ជាយផ្លូវ — ទោលជាប់ពណ៌ស តាមជាយផ្លូវ", en: "Edge Line — Single solid white line along the road edge." },
      { id: "PW03-M2-09", kh: "គំនូសសញ្ញាទោល លឿង-ស លើខឿនចិញ្ចើមផ្លូវ — ហាមចត", en: "Yellow-White Curb Markings — Indicates parking prohibition." },
      { id: "PW03-M2-10", kh: "គំនូសសញ្ញាទោល ក្រហម-ស លើខឿនចិញ្ចើមផ្លូវ — ហាមឈប់", en: "Red-White Curb Markings — Indicates stopping prohibition." },
      { id: "PW03-M2-11", kh: "គំនូសសញ្ញា លឿង-ខ្មៅ លើប្លុកចែកទ្រូងផ្លូវ", en: "Yellow-Black Markings On Road Divider Block — Separates opposite directions." },
      { id: "PW03-M3-01", kh: "គំនូសសញ្ញាព្រួញទៅមុខត្រង់ — គន្លងសំរាប់ទៅមុខត្រង់តែប៉ុណ្ណោះ", en: "Straight Arrow — Lane for going straight through only." },
      { id: "PW03-M3-02", kh: "គំនូសសញ្ញាព្រួញទៅមុខត្រង់ និងបត់ស្តាំ", en: "Turn Right And Straight Arrow — Lane for straight or right turn only." },
      { id: "PW03-M3-03", kh: "គំនូសសញ្ញាព្រួញទៅមុខត្រង់ និងបត់ឆ្វេង", en: "Turn Left And Straight Arrow — Lane for straight or left turn only." },
      { id: "PW03-M3-04", kh: "គំនូសសញ្ញាព្រួញ បត់ស្តាំ — គន្លងសំរាប់បត់ស្តាំតែប៉ុណ្ណោះ", en: "Turn Right Arrow — Lane for turning right only." },
      { id: "PW03-M3-05", kh: "គំនូសសញ្ញាព្រួញ បត់ឆ្វេង — គន្លងសំរាប់បត់ឆ្វេងតែប៉ុណ្ណោះ", en: "Turn Left Arrow — Lane for turning left only." },
      { id: "PW03-M3-06", kh: "គំនូសសញ្ញាព្រួញ ងាកស្តាំ — នៅខាងមុខមានគំនូសជាប់ពណ៌លឿង", en: "Keep Right Arrow — Solid yellow line ahead." },
      { id: "PW03-M3-07", kh: "គំនូសសញ្ញាព្រួញ ងាកស្តាំ (លើគន្លងផ្លូវ) — គន្លងនេះរួមចូលគន្លងស្តាំ", en: "Keep Right Arrow — This lane will merge into the right lane ahead." },
      { id: "PW03-M3-08", kh: "គំនូសសញ្ញាព្រួញ ងាកឆ្វេង (លើគន្លងផ្លូវ) — គន្លងនេះរួមចូលគន្លងឆ្វេង", en: "Keep Left Arrow — This lane will merge into the left lane ahead." },
      { id: "PW03-M4-01", kh: "គំនូសសញ្ញាតំបន់ហាមជាន់ (ផ្លូវមានចរាចរពីរទិស)", en: "Diagonal Hatched Markings (Two-Way Road) — Separates opposite directions." },
      { id: "PW03-M4-02", kh: "គំនូសសញ្ញាតំបន់ហាមជាន់ (ផ្លូវឯកទិស)", en: "Chevron Markings (One-Way Road) — Separates lanes in one-way traffic." },
      { id: "PW03-M4-03", kh: "គំនូសសញ្ញាតំបន់ទ្រូងផ្លូវ (ជាប់តែមចិញ្ចើមផ្លូវ)", en: "Diagonal Hatched Markings (On Road Edge) — Defines traffic area." },
      { id: "PW03-M4-04", kh: "គំនូសសញ្ញា សំរាប់ថ្មើរជើងឆ្លងកាត់", en: "Crosswalk Markings — White broken lines for pedestrian crossing." },
      { id: "PW03-M4-05", kh: "គំនូសសញ្ញា សំរាប់រថយន្តក្រុងឈប់", en: "Bus Stop Markings — Yellow zigzag markings for bus stops." },
      { id: "PW03-M4-06", kh: "គំនូសសញ្ញា សំរាប់រថយន្តចត (ស្របតាមចិញ្ចើមផ្លូវ)", en: "Parking Bay Markings (Parallel Parkings) — Parallel to the curb." },
      { id: "PW03-M4-07", kh: "គំនូសសញ្ញា សំរាប់រថយន្តចត (កែងតែមចិញ្ចើមផ្លូវ)", en: "Parking Bay Markings (Vertical Parkings) — Perpendicular to the curb." },
      { id: "PW03-M4-08", kh: "គំនូសសញ្ញា សំរាប់រថយន្តចត (បញ្ឆិតតែមចិញ្ចើមផ្លូវ)", en: "Parking Bay Markings (Angled Parkings) — Angled to the curb." },
      { id: "PW03-M4-09", kh: "គំនូសសញ្ញា លើទួល ទ្រូងផ្លូវ", en: "Road Hump Marking — Yellow and black diagonal hatched markings on hump." },
    ],
  },
  {
    key: "l1", code: "PW03-L1", count: 11,
    label: { en: "Traffic Light Signals", kh: "ភ្លើងសញ្ញាចរាចរ" },
    color: "#dc2626",
    signs: [
      { id: "PW03-L1-01", kh: "ភ្លើងសញ្ញាចរាចរណ៍ ពណ៌ រាងមូល — បញ្ជាទិសដៅចរាចរនៅត្រង់ផ្លូវប្រសព្វ", en: "Three Colored Circular Signals — Controls traffic direction at intersections." },
      { id: "PW03-L1-02", kh: "ភ្លើងសញ្ញាចរាចរ សំរាប់ថ្មើរជើងឆ្លងកាត់", en: "Pedestrian Crossing Signals — Used with three-colored circular traffic lights." },
      { id: "PW03-L1-03", kh: "ភ្លើងសញ្ញាចរាចរណ៍ ពណ៌ ជាព្រួញ (ទៅមុខត្រង់)", en: "Three Colored Arrow Signals (Straight Through) — Straight-through only." },
      { id: "PW03-L1-04", kh: "ភ្លើងសញ្ញាចរាចរណ៍ ពណ៌ ជាព្រួញ (បត់ស្តាំ)", en: "Three Colored Arrow Signals (Right Turn) — Right turn only." },
      { id: "PW03-L1-05", kh: "ភ្លើងសញ្ញាចរាចរណ៍ ពណ៌ ជាព្រួញ (បត់ឆ្វេង)", en: "Three Colored Arrow Signals (Left Turn) — Left turn only." },
      { id: "PW03-L1-06", kh: "ភ្លើងសញ្ញាចរាចរណ៍ ពណ៌ ជាព្រួញ (ទៅមុខត្រង់ និងបត់ស្តាំ)", en: "Three Colored Arrow Signals (Straight Through And Right Turn)." },
      { id: "PW03-L1-07", kh: "ភ្លើងសញ្ញាចរាចរណ៍ ពណ៌ ជាព្រួញ (ទៅមុខត្រង់ និងបត់ឆ្វេង)", en: "Three Colored Arrow Signals (Straight Through And Left Turn)." },
      { id: "PW03-L1-08", kh: "ភ្លើងសញ្ញាចរាចរ សំរាប់ថ្មើរជើងឆ្លងកាត់ (ប្រើជាមួយភ្លើងសញ្ញាចរាចរណ៍ជាព្រួញ)", en: "Pedestrian Crossing Signals — Used with three-colored arrow traffic lights." },
      { id: "PW03-L1-09", kh: "ភ្លើងសញ្ញាចរាចរណ៍ពីរពណ៌ រាងមូល — នៅត្រង់បញ្ជរបង់ប្រាក់ ឬ ច្រកចេញចូល", en: "Two Colored Circular Signals — At toll booths or entry/exit points." },
      { id: "PW03-L1-10", kh: "ភ្លើងសញ្ញាពណ៌ក្រហម ភ្លឺប្តឹបៗ — បញ្ជាអោយឈប់", en: "Red Flashing Signals — Orders all drivers to stop." },
      { id: "PW03-L1-11", kh: "ភ្លើងសញ្ញាពណ៌លឿង ភ្លឺប្តឹបៗ — បញ្ជាអោយបន្ថយល្បឿន និងប្រុងប្រយ័ត្ន", en: "Yellow Flashing Signals — Orders drivers to slow down and be cautious." },
    ],
  },
  {
    key: "o1", code: "PW03-O1", count: 5,
    label: { en: "Officer / Human Signals", kh: "សញ្ញាបញ្ជាដោយភ្នាក់ងារ" },
    color: "#0d9488",
    signs: [
      { id: "PW03-O1-01", kh: "រូបភាពបញ្ជាចរាចរមើលពីចំហៀង — ដៃលាតសន្ធឹង អនុញ្ញាតអោយទៅបាន", en: "Traffic Control Signal Viewed From Side — Arms extended; traffic permitted." },
      { id: "PW03-O1-02", kh: "រូបភាពបញ្ជាចរាចរមើលពីមុខ ឬ ពីក្រោយ — ដៃលាតសន្ធឹង ត្រូវឈប់ដាច់ខាត", en: "Traffic Control Signal Viewed From Front Or Back — Arms extended; absolute stop." },
      { id: "PW03-O1-03", kh: "រូបភាពបញ្ជាចរាចរមើលពីមុខ ឬ ពីក្រោយ (លើកដៃ) — បើកបរប្រុងប្រយ័ត្ន និងត្រៀមឈប់", en: "Traffic Control Signal Viewed From Front Or Back (Arm Raised) — Proceed with caution; prepare to stop." },
      { id: "PW03-O1-04", kh: "រូបភាពបញ្ជាចរាចរផ្សេងៗ — បន្ថែមល្បឿន / ទៅមុខ / ឈប់", en: "Various Traffic Control Signals — Speed up / Go ahead / Stop." },
      { id: "PW03-O1-05", kh: "រូបភាពបញ្ជាចរាចរណ៍លើនាវា ឬ ចរាចរទោចក្រយានយន្ត — វាងស្តាំ / បន្ថយល្បឿន / ឈប់", en: "Traffic Control Signals On Vessels Or For Motorcycles — Detour right / Slow down / Stop." },
    ],
  },
];

// ─── Combine All ──────────────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  ...CATEGORIES,
  ...WARNING_CATEGORIES,
  ...GUIDE_CATEGORIES,
  ...OTHER_CATEGORIES,
];

const TOTAL_SIGNS = ALL_CATEGORIES.reduce((sum, cat) => sum + cat.count, 0);

// ─── Component ────────────────────────────────────────────────────────────────
export function TrafficSignsReferenceClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery && !selectedCategory) return ALL_CATEGORIES;

    return ALL_CATEGORIES.map((cat) => {
      if (selectedCategory && cat.key !== selectedCategory) return null;

      const filteredSigns = cat.signs.filter((sign) => {
        const query = searchQuery.toLowerCase();
        return (
          sign.id.toLowerCase().includes(query) ||
          sign.kh.toLowerCase().includes(query) ||
          sign.en.toLowerCase().includes(query)
        );
      });

      if (filteredSigns.length === 0) return null;
      return { ...cat, signs: filteredSigns, count: filteredSigns.length };
    }).filter(Boolean) as Category[];
  }, [searchQuery, selectedCategory]);

  const l = {
    badge: kh ? "ឯកសារយោង" : "Reference Document",
    title: kh ? "សញ្ញាចរាចរកម្ពុជា" : "Cambodia Traffic Signs",
    subtitle: kh
      ? "បញ្ជីពេញលេញនៃឧបករណ៍គ្រប់គ្រងចរាចរ ២៧២ ប្រភេទ ទាំង ១១ ប្រភេទ — ប្រភព: ក្រសួងសាធារណការ និងដឹកជញ្ជូន PW03"
      : "Complete list of 272 traffic control devices across 11 categories — Source: Ministry of Public Works and Transport PW03 series",
    search: kh ? "ស្វែងរកតាម ID ឬ ពណ៌នា..." : "Search by ID or description...",
    all: kh ? "ទាំងអស់" : "All",
    total: kh ? "សរុប" : "Total",
    items: kh ? "ធាតុ" : "items",
    categories: kh ? "ប្រភេទ" : "categories",
    footer: kh
      ? "២០២៦ KWD — Kesararam With Digital · ប្រភព: ក្រសួងសាធារណការ និងដឹកជញ្ជូន PW03 · Technovation Girls Cambodia"
      : "2026 KWD — Kesararam With Digital · Source: MPWT PW03 Series · Technovation Girls Cambodia",
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/brand/kwd-black-nobg_zicjml.svg"
              alt="KWD"
              width={56}
              height={56}
              className="object-contain invert"
              unoptimized
            />
          </div>
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.25em] bg-yellow-400 text-black px-3 py-1 mb-4"
            style={kf}
          >
            {l.badge}
          </span>
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-3 text-white"
            style={kf}
          >
            {l.title}
          </h1>
          <p className="text-sm text-zinc-400 font-medium max-w-3xl leading-relaxed" style={kf}>
            {l.subtitle}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
            <div className="bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-3xl font-black text-white">{TOTAL_SIGNS}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-1" style={kf}>
                {l.total} {l.items}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-3xl font-black text-white">{ALL_CATEGORIES.length}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-1" style={kf}>
                {l.categories}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-3xl font-black text-white">PW03</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-1" style={kf}>
                MPWT Series
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <input
            type="text"
            placeholder={l.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            style={kf}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs font-black px-3 py-1.5 border-2 border-black transition-all ${
                !selectedCategory ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-100"
              }`}
              style={kf}
            >
              {l.all}
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-xs font-black px-3 py-1.5 border-2 border-black transition-all ${
                  selectedCategory === cat.key ? "text-white" : "bg-white text-black hover:bg-zinc-100"
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.key ? cat.color : undefined,
                  ...kf,
                }}
              >
                {kh ? cat.label.kh : cat.label.en} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 font-bold" style={kf}>
              {kh ? "រកមិនឃើញលទ្ធផល" : "No results found"}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((cat) => (
              <div key={cat.key} id={cat.key}>
                {/* Category Header */}
                <div
                  className="border-2 border-black p-4 mb-4"
                  style={{ backgroundColor: cat.color, boxShadow: "4px 4px 0 #000" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-black/60 uppercase tracking-widest mb-1">
                        {cat.code}
                      </p>
                      <h2 className="text-2xl font-black text-black" style={kf}>
                        {kh ? cat.label.kh : cat.label.en}
                      </h2>
                    </div>
                    <span className="text-3xl font-black text-black">{cat.count}</span>
                  </div>
                </div>

                {/* Signs Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {cat.signs.map((sign) => (
                    <div
                      key={sign.id}
                      className="border-2 border-black bg-white p-4 hover:shadow-lg transition-shadow"
                    >
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                        {sign.id}
                      </p>
                      <p className="text-sm font-bold text-black mb-2 leading-relaxed" style={kf}>
                        {kh ? sign.kh : sign.en}
                      </p>
                      {kh && (
                        <p className="text-xs text-zinc-500 leading-relaxed">{sign.en}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black bg-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/kwd-black-nobg_zicjml.svg"
                alt="KWD"
                width={24}
                height={24}
                className="object-contain opacity-40"
                unoptimized
              />
              <p className="text-xs text-zinc-400 font-medium" style={kf}>
                {l.footer}
              </p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <Link href="/terms" className="text-zinc-500 hover:text-black transition-colors" style={kf}>
                {kh ? "លក្ខខណ្ឌ" : "Terms"}
              </Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-black transition-colors" style={kf}>
                {kh ? "ភាពឯកជន" : "Privacy"}
              </Link>
              <Link href="/about" className="text-zinc-500 hover:text-black transition-colors" style={kf}>
                {kh ? "អំពី" : "About"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
