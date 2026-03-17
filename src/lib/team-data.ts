export interface TeamMember {
  id: string;
  name: string;
  nameKh: string;
  role: "student" | "mentor";
  age?: number;
  specialty?: string;
  specialtyKh?: string;
  division: string;
  school: string;
  location: string;
  imageUrl: string;
  vsid: string;
  cardNo: string;
  enrolled: string;
  expiry: string;
  accessPrivileges: string[];
  bio: string;
  bioKh: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "danai-yin",
    name: "DANAI YIN",
    nameKh: "ដាណៃ យីន",
    role: "student",
    age: 12,
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/DANAI_YIN_sezo2q.jpg",
    vsid: "VSID-2026-001",
    cardNo: "C50777001",
    enrolled: "2025",
    expiry: "2026/04/20",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Mentor Sessions"],
    bio: "Student developer passionate about solving community problems with technology.",
    bioKh: "និស្សិតអភិវឌ្ឍន៍ដែលចូលចិត្តដោះស្រាយបញ្ហាសហគមន៍ដោយប្រើបច្ចេកវិទ្យា។",
  },
  {
    id: "chantha-kanika",
    name: "CHANTHA KANIKA",
    nameKh: "ចន្ថា កានិកា",
    role: "student",
    age: 13,
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/CHANTHA_KANIKA_gmh6w9.jpg",
    vsid: "VSID-2026-002",
    cardNo: "C50777002",
    enrolled: "2025",
    expiry: "2026/04/20",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Mentor Sessions"],
    bio: "Creative thinker focused on user experience and app design.",
    bioKh: "អ្នកគិតច្នៃប្រឌិតដែលផ្តោតលើបទពិសោធន៍អ្នកប្រើប្រាស់និងការរចនាកម្មវិធី។",
  },
  {
    id: "roza-neun",
    name: "ROZA NEUN",
    nameKh: "រ៉ូហ្សា ន័ន",
    role: "student",
    age: 11,
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739867/Roza_Neun_ciz33b.jpg",
    vsid: "VSID-2026-003",
    cardNo: "C50777003",
    enrolled: "2025",
    expiry: "2026/04/20",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Mentor Sessions"],
    bio: "Enthusiastic learner exploring AI and machine learning concepts.",
    bioKh: "អ្នករៀនដ៏ចំណាន ដែលស្វែងយល់ពី AI និងគំនិតការរៀនម៉ាស៊ីន។",
  },
  {
    id: "lin-many",
    name: "LIN MANY",
    nameKh: "លីន ម៉ានី",
    role: "student",
    age: 13,
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/Lin_Many_nffno6.jpg",
    vsid: "VSID-2026-004",
    cardNo: "C50777004",
    enrolled: "2025",
    expiry: "2026/04/20",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Mentor Sessions"],
    bio: "Team researcher and data analyst with strong problem-solving skills.",
    bioKh: "អ្នកស្រាវជ្រាវក្រុមនិងអ្នកវិភាគទិន្នន័យដែលមានជំនាញដោះស្រាយបញ្ហាខ្លាំង។",
  },
  {
    id: "sun-runamara",
    name: "SUN RUNAMARA",
    nameKh: "សុន រុណម៉ារ៉ា",
    role: "student",
    age: 11,
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/SUN_RUNAMARA_rmtlzf.jpg",
    vsid: "VSID-2026-005",
    cardNo: "C50777005",
    enrolled: "2025
",
    expiry: "2026/04/20",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Mentor Sessions"],
    bio: "Passionate about building apps that make a difference in the community.",
    bioKh: "ចូលចិត្តបង្កើតកម្មវិធីដែលបង្កើតភាពខុសគ្នានៅក្នុងសហគមន៍។",
  },
  {
    id: "piseth-pheap",
    name: "PISETH PHEAP",
    nameKh: "ពិសិដ្ឋ ភាព",
    role: "mentor",
    specialty: "Teacher & Program Lead",
    specialtyKh: "គ្រូបង្រៀននិងអ្នកដឹកនាំកម្មវិធី",
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/Piseth_Pheap_b189jm.jpg",
    vsid: "VSID-2026-M01",
    cardNo: "CM50777001",
    enrolled: "2025",
    expiry: "2026/09/30",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Admin Panel", "Mentor Portal"],
    bio: "Experienced teacher guiding students through the Technovation Girls program.",
    bioKh: "គ្រូបង្រៀនដែលមានបទពិសោធន៍ ណែនាំសិស្សតាមរយៈកម្មវិធី Technovation Girls។",
  },
  {
    id: "shiliaiwei",
    name: "VI SRIE",
    nameKh: "វី ស្រី",
    role: "mentor",
    specialty: "University Student — Java / Project Management",
    specialtyKh: "និស្សិតសាកលវិទ្យាល័យ — Java / ការគ្រប់គ្រងគម្រោង",
    division: "Junior Division",
    school: "Kesararam With Digital",
    location: "Siem Reap, Cambodia",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739867/shiliaiwei_ojrlj7.jpg",
    vsid: "VSID-2026-M02",
    cardNo: "CM50777002",
    enrolled: "2025",
    expiry: "2026/09/30",
    accessPrivileges: ["Lab", "Library", "Competition Platform", "Mentor Portal", "Code Review"],
    bio: "University student specializing in Java development and project management.",
    bioKh: "និស្សិតសាកលវិទ្យាល័យដែលជំនាញក្នុងការអភិវឌ្ឍន៍ Java និងការគ្រប់គ្រងគម្រោង។",
  },
];
