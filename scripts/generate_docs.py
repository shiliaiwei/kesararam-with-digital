#!/usr/bin/env python3
import os
import sys
import docx
from docx.shared import Pt, Inches
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ----------------------------------------------------------------------
# 1. DATA DEFINITIONS (Khmer Only)
# ----------------------------------------------------------------------

DOCUMENTS = {
    "privacy": {
        "filename_prefix": "KWD_Privacy_Policy_Khmer",
        "title": "គោលការណ៍ភាពឯកជន (Privacy Policy)",
        "subtitle": "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: មីនា ២០២៦ — KWD · Kesararam With Digital · Technovation Girls Cambodia",
        "sections": [
            {
                "heading": "",
                "paragraphs": [
                    "KWD (Kesararam With Digital) គឺជាវេទិកាសិក្សាការបើកបរ និងស្គាល់សញ្ញាចរាចរណ៍ ដែលបង្កើតឡើងដោយយុវនារីខ្មែរពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls។ យើងប្តេជ្ញាការពារភាពឯកជនរបស់សិស្ស គ្រូ និងអ្នកប្រើប្រាស់ទាំងអស់ ស្របតាមស្តង់ដារសុវត្ថិភាព Technovation និងគោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព (SDG) របស់អង្គការសហប្រជាជាតិ។",
                    "នៅពេលចុះឈ្មោះ យើងប្រមូលឈ្មោះ ឈ្មោះអ្នកប្រើ អ៊ីមែល និងពាក្យសម្ងាត់ (រក្សាទុកជាលេខកូដសុវត្ថិភាព)។ គ្រូ និងអ្នកគ្រប់គ្រងអាចផ្តល់ឈ្មោះសាលា និងតួនាទីផងដែរ។ គណនីសិស្សត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រងសាលា — មិនមែនដោយផ្ទាល់ពីសិស្សអាយុក្រោម ១៣ ឆ្នាំទេ។ យើងប្រមូលតែឈ្មោះបង្ហាញ និងឈ្មោះអ្នកប្រើ ដើម្បីចូលរួមក្នុងការប្រឡង និងតាមដានវឌ្ឍនភាព។ យើងក៏ប្រមូលពិន្ទុហ្គេម លទ្ធផលប្រឡង កំណត់ត្រាចូលរួម និងទម្លាប់ប្រើប្រាស់ ដើម្បីកែលម្អវេទិកា។",
                    "ព័ត៌មានរបស់អ្នកត្រូវបានប្រើដើម្បីផ្ទៀងផ្ដើមអ្នកប្រើប្រាស់ បង្ហាញចំណាត់ថ្នាក់ តាមដានវឌ្ឍនភាព ដំណើរការវគ្គប្រឡងផ្ទាល់ និងផ្តល់រង្វាន់។ ទិន្នន័យប្រមូលផ្តុំ (មិនបង្ហាញអត្តសញ្ញាណ) ជួយយើងយល់ពីប្រភេទ និងរបៀបលេងដែលមានប្រសិទ្ធភាពបំផុត ដើម្បីកែលម្អខ្លឹមសារ។ យើងអាចផ្ញើការជូនដំណឹងសំខាន់ (ដូចជាការជូនដំណឹងសុវត្ថិភាពគណនី) ប៉ុន្តែមិនផ្ញើអ៊ីមែលទីផ្សារដោយគ្មានការយល់ព្រមរបស់អ្នកទេ។",
                    "KWD ត្រូវបានរចនាសម្រាប់បរិយាកាសសាលា។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។ ឪពុកម្តាយ ឬអាណាព្យាបាលអាចទាក់ទងយើងដើម្បីស្នើសុំចូលមើល កែ ឬលុបទិន្នន័យកូនរបស់ពួកគេ។ អ្នកណែនាំ និងអ្នកស្ម័គ្រចិត្តទាំងអស់ដែលធ្វើការជាមួយក្រុមរបស់យើងអនុវត្តតាម Technovation Volunteer Code of Conduct ដើម្បីធានាបរិយាកាសសិក្សាដែលមានសុវត្ថិភាព។",
                    "ទិន្នន័យត្រូវរក្សាទុកនៅ Neon (PostgreSQL) ជាមួយការភ្ជាប់ដែលបានអ៊ិនគ្រីប។ រូបភាពប្រវត្តិរូបត្រូវរក្សាទុកនៅ Cloudinary ជាមួយការគ្រប់គ្រងការចូលប្រើ។ ពាក្យសម្ងាត់ត្រូវបានហ្ហាស (hash) ដោយប្រើក្បួនដោះស្រាយស្តង់ដារ។ វគ្គប្រើប្រាស់ JWT tokens ដែលមានកំណត់ពេល។ ផ្លូវ API ទាំងអស់អនុវត្តការគ្រប់គ្រងការចូលប្រើតាមតួនាទី។ ក្នុងករណីមានការបំពានទិន្នន័យ យើងនឹងជូនដំណឹងអ្នកភ្លាមៗតាមអ៊ីមែលដែលបានចុះឈ្មោះ។",
                    "អ្នកអាចមើល និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រវត្តិរូបរបស់អ្នកបានគ្រប់ពេលពីការកំណត់គណនី។ អ្នកអាចស្នើសុំលុបគណនី និងទិន្នន័យដែលពាក់ព័ន្ធ — ពិន្ទុហ្គេមនៅក្នុងចំណាត់ថ្នាក់សាធារណៈអាចត្រូវរក្សាទុកក្នុងទម្រង់អនាមិក។ យើងប្រើ Cloudinary, Neon, និង Vercel — នីមួយៗមានគោលការណ៍ភាពឯកជនផ្ទាល់ខ្លួន។ យើងមិនលក់ទិន្នន័យរបស់អ្នកទៅភាគីទីបីណាមួយឡើយ។",
                    "KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុងប្រកបដោយចីរភាព) ដោយផ្តល់ការអប់រំទ្រឹស្ដីបើកបរឥតគិតថ្លៃ ជាភាសាខ្មែរ-អង់គ្លេស ដោយផ្តោតលើការផ្តល់អំណាចដល់យុវនារីខ្មែរតាមរយៈបច្ចេកវិទ្យា។ យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍នេះ — ការប្រើប្រាស់ KWD បន្តបន្ទាប់ពីការផ្លាស់ប្តូរ មានន័យថាអ្នកទទួលយកគោលការណ៍ដែលបានធ្វើបច្ចុប្បន្នភាព។ សម្រាប់សំណួរទាក់ទងភាពឯកជន សូមទំនាក់ទំនងក្រុម KWD នៅសាលាបឋមសិក្សាកេសរារាម ឬតាមរយៈទំព័រ About។"
                ]
            }
        ]
    },
    "terms": {
        "filename_prefix": "KWD_Terms_Conditions_Khmer",
        "title": "លក្ខខណ្ឌប្រើប្រាស់ (Terms of Service)",
        "subtitle": "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: មេសា ២០២៦ — KWD · Technovation Girls 2026 · ក្រុម #50777 · Junior Division · សៀមរាប, កម្ពុជា",
        "sections": [
            {
                "heading": "១. អំពី KWD",
                "paragraphs": ["KWD (Kesararam With Digital) គឺជាវេទិកាគេហទំព័រឥតគិតថ្លៃ ពីរភាសា (ខ្មែរ និងអង់គ្លេស) ដែលជួយអ្នករៀនខ្មែរត្រៀមប្រឡងទ្រឹស្ដីបើកបរជាតិ។ បង្កើតដោយក្រុមយុវនារីខ្មែរប្រាំនាក់ពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls 2026 — ផ្នែក Junior ក្រុម #50777។ វេទិកានេះគ្របដណ្ដប់ប្រភេទប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទាំង ៨ ។ KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុងប្រកបដោយចីរភាព)។"]
            },
            {
                "heading": "២. ការទទួលយកលក្ខខណ្ឌ",
                "paragraphs": ["ដោយបង្កើតគណនី ឬប្រើ KWD អ្នកយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។ ពួកវាអនុវត្តចំពោះអ្នកប្រើទាំងអស់ — សិស្ស គ្រូ និងអ្នកគ្រប់គ្រង។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមមិនប្រើវេទិកា។ លក្ខខណ្ឌទាំងនេះត្រូវបានគ្រប់គ្រងដោយច្បាប់នៃព្រះរាជាណាក្រកម្ពុជា។"]
            },
            {
                "heading": "៣. គណនីអ្នកប្រើ និងលក្ខណៈសម្បត្តិ",
                "paragraphs": ["សិស្ស គ្រូ និងអ្នកគ្រប់គ្រងសាលាអាចចុះឈ្មោះ។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។ អ្នកទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃព័ត៌មានចូល។ កុំចែករំលែកពាក្យសម្ងាត់។"]
            },
            {
                "heading": "៤. ការប្រើប្រាស់ត្រឹមត្រូវ",
                "paragraphs": ["KWD គឺសម្រាប់ការប្រើប្រាស់ក្នុងការអប់រំ។ អ្នកមិនអាចព្យាយាមបន្លំ ឬរៀបចំពិន្ទុ ចែករំលែកចម្លើយ ឬផ្ទុកខ្លឹមសារខុសច្បាប់ ឬក្លែងបន្លំអ្នកប្រើ ឬសាលាផ្សេង។ ការរំលោភអាចនាំឱ្យព្យួរ ឬហាមឃាត់គណនីដោយគ្មានការជូនដំណឹង។"]
            },
            {
                "heading": "៥. ពិន្ទុ ចំណាត់ថ្នាក់ និងរង្វាន់",
                "paragraphs": ["ពិន្ទុហ្គេមផ្ទាល់ត្រូវបានកត់ត្រា និងរួមចំណែកដល់ពិន្ទុអស់មួយជីវិត និងចំណាត់ថ្នាក់។ ចំណាត់ថ្នាក់គឺជាសាធារណៈ — ឈ្មោះបង្ហាញ និងពិន្ទុរបស់អ្នកអាចមើលឃើញដោយអ្នកទស្សនាទាំងអស់។ ពិន្ទុ និងរង្វាន់គ្មានតម្លៃជាប្រាក់ ហើយមិនអាចផ្ទេរ លក់ ឬប្តូរជាប្រាក់ទេ។"]
            },
            {
                "heading": "៦. ការជាវ និងការទូទាត់",
                "paragraphs": ["KWD ដំណើរការលើគំរូ freemium។ សិស្សឥតគិតថ្លៃជាអចិន្ត្រៃយ៍។ ផែនការគ្រូ Pro ($10/ខែ តម្លៃធម្មតា; តម្លៃពិសេស $5/ខែ រហូតដល់ចុងឆ្នាំ ២០២៦) និងផែនការសាលារៀន និងវិទ្យាស្ថាន មានសម្រាប់គរុកោសល្យ។ ផែនការសាលារៀន/វិទ្យាស្ថាន រួមបញ្ចូលសាលារៀន ($19/ខែ តម្លៃពិសេស; $39/ខែ តម្លៃធម្មតា) និងវិទ្យាស្ថាន ($29/ខែ តម្លៃពិសេស; $59/ខែ តម្លៃធម្មតា)។ កញ្ចប់ប្រចាំឆ្នាំរួមបញ្ចូលការបញ្ចុះតម្លៃ ៤ ខែឥតគិតថ្លៃសម្រាប់គ្រូ Pro ($៤០/ឆ្នាំ តម្លៃពិសេស; $៨០/ឆ្នាំ តម្លៃធម្មតា) និង ៣ ខែឥតគិតថ្លៃសម្រាប់សាលារៀន ($១៧០/ឆ្នាំ តម្លៃពិសេស; $៣៥០/ឆ្នាំ តម្លៃធម្មតា) និងវិទ្យាស្ថាន ($២៦០/ឆ្នាំ តម្លៃពិសេស; $៥៣០/ឆ្នាំ តម្លៃធម្មតា)។ ការទូទាត់ទទួលយកតាម KHQR (ធនាគារ NBC ទាំងអស់) Visa Mastercard និង PayPal។ ការចូលប្រើប្រាស់ត្រូវបានបើកក្នុង ២៤ ម៉ោង។ គ្មានការសងប្រាក់វិញបន្ទាប់ពីការចូលប្រើប្រាស់ត្រូវបានផ្ដល់ លើកលែងតែករណីបច្ចេកទេស។"]
            },
            {
                "heading": "៧. ខ្លឹមសារ និងការបង្ហាញ AI",
                "paragraphs": ["ខ្លឹមសារ ការរចនា និងកូដទាំងអស់នៅ KWD ជាកម្មសិទ្ធិរបស់សាលាបឋមសិក្សាកេសរារាម ឬបានទទួលអាជ្ញាប័ណ្ណ។ ឧបករណ៍ AI ត្រូវបានប្រើសម្រាប់ការបង្កើតកូដ ការសរសេរខ្លឹមសារ និងការស្រាវជ្រាវ។ លទ្ធផល AI ទាំងអស់ត្រូវបានត្រួតពិនិត្យ ផ្ទៀងផ្ទីង និងអនុម័តដោយក្រុមមុនការផ្សព្វផ្សាយ។"]
            },
            {
                "heading": "៨. ដំណើរការត្រួតពិនិត្យខ្លឹមសារ",
                "paragraphs": ["KWD ប្រើលំហូរការអនុម័តខ្លឹមសារបីកម្រិត: (១) សមាជិកក្រុមរៀបចំ និងដាក់ស្នើខ្លឹមសារ; (២) គ្រូណែនាំ និងគ្រូបង្ហាត់ត្រួតពិនិត្យភាពត្រឹមត្រូវ; (៣) ការអនុម័តចុងក្រោយដោយប្រធានក្រុមមុនការផ្សព្វផ្សាយ។"]
            },
            {
                "heading": "៩. ការបដិសេធ និងការកំណត់ទំនួលខុសត្រូវ",
                "paragraphs": ["KWD ត្រូវបានផ្ដល់ដូចដែលវាជា។ យើងមិនធានាថាការប្រើ KWD នឹងនាំឱ្យជាប់ការប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទេ។ យើងមិនទទួលខុសត្រូវចំពោះការបាត់បង់ ឬការខូចខាតណាមួយដែលកើតឡើងពីការប្រើប្រាស់វេទិកា។"]
            },
            {
                "heading": "១០. ការផ្លាស់ប្ដូរលក្ខខណ្ឌ",
                "paragraphs": ["យើងអាចធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌទាំងនេះបានគ្រប់ពេល។ ការប្រើប្រាស់ KWD បន្តបន្ទាប់ពីការផ្លាស់ប្ដូរ មានន័យថាការទទួលយកលក្ខខណ្ឌដែលបានធ្វើបច្ចុប្បន្នភាព។"]
            }
        ]
    },
    "about": {
        "filename_prefix": "KWD_About_Page_Khmer",
        "title": "កេសរារាម ជាមួយឌីជីថល (About Kesararam With Digital)",
        "subtitle": "ស្នាដៃយុវនារីខ្មែរ៖ លើកកម្ពស់ការអប់រំសុវត្ថិភាពចរាចរណ៍ តាមរយៈនវានុវត្តន៍បច្ចេកវិទ្យា",
        "sections": [
            {
                "heading": "សេចក្តីផ្តើម និងរឿងរ៉ាវរបស់ពួកយើង",
                "paragraphs": [
                    "«កេសរារាម» ទីអារាម និងសាលារៀន ដែលជាថ្នាលបណ្ដុះចំណេះដឹងចំណាស់ជាងគេក្នុងសហគមន៍របស់យើង។ ទីជម្រកអប់រំដ៏មានតម្លៃមួយនេះ បានបណ្តុះស្មារតីកុមារគ្រប់រូបឱ្យដឹងច្បាស់ថា៖ ការសិក្សាមិនមែនជាការត្រៀមលក្ខណៈសម្រាប់ជីវិតនោះទេ ព្រោះការរៀនសូត្រ គឺជាសោរដែលបើកទ្វារទៅកាន់ពិភពលោកនៃជីវិតទាំងមូល។",
                    "យើងយកស្មារតីមួយនេះទៅបង្ហាញពិភពលោក ដែលបច្ចេកវិទ្យាកំពុងដើរទៅមុខយ៉ាងលឿន។ ថ្វីបើ AI និងប្រព័ន្ធស្វ័យប្រវត្តិកំពុងផ្លាស់ប្ដូរគ្រប់វិស័យការងារ ប៉ុន្តែឱកាសសម្រាប់យុវនារីក្នុងសហគមន៍ដូចពួកយើង នៅមានតិចតួចណាស់។ ហើយពួកយើងនៅទីនេះ គឺដើម្បីរួមគ្នាផ្លាស់ប្ដូរតថភាពសង្គមមួយនេះឱ្យបាន។",
                    "«កេសរារាម ជាមួយឌីជីថល» (Kesararam With Digital) គឺជាបណ្តុំយុវនារីខ្មែរដែលបោះជំហានឈានចូលយុគសម័យបច្ចេកវិទ្យា និង AI ដោយមិនត្រឹមតែធ្វើជាអ្នកទទួលចំណេះដឹងពីឌីជីថលនោះទេ ប៉ុន្តែគឺដើម្បីដើរតួជាអ្នកបង្កើត និងបញ្ចេញពន្លឺអភិវឌ្ឍន៍ដោយផ្ទាល់។",
                    "គ្រូ Mentors បានបង្រៀនយើងថា AI មិនមែនជាការគំរាមកំហែងដែលត្រូវខ្លាចនោះទេ ប៉ុន្តែវាជាឧបករណ៍ដែលត្រូវចេះប្រើប្រាស់ឱ្យត្រូវទិសដៅ។ តួនាទីរបស់វាគឺជួយដុសខាត់ការគិតរបស់យើងឱ្យកាន់តែមុតស្រួច ពោលគឺមកដើម្បីជាកម្លាំងជំនួយដល់ការត្រិះរិះ មិនមែនមកជំនួសការគិតរបស់យើងឡើយ។",
                    "វត្តអារាមបង្រៀនយើងឱ្យមានវិន័យ សាលារៀនបង្រៀនយើងឱ្យស្គាល់ទ្រឹស្ដី រីឯគ្រូ Mentors បណ្តុះយើងឱ្យចេះអនុវត្តផ្ទាល់។ ក្នុងនាមជាបេក្ខនារីនៃកម្មវិធី Technovation Girls ពួកយើងកំពុងរៀនគិត និងបោះជំហានធ្វើការដូចជាសហគ្រិនវ័យក្មេង ដែលច្នៃប្រឌិតដំណោះស្រាយឌីជីថលសម្រាប់សង្គមជាតិ។",
                    "«កេសរារាម ជាមួយឌីជីថល»។ គ្រឹះនៃស្មារតីសហគ្រិន ភាពច្បាស់លាស់នៃគោលបំណង និងជំហានម៉ឺងម៉ាត់ឆ្ពោះទៅកាន់ភាពជាអ្នកដឹកនាំ។"
                ]
            },
            {
                "heading": "បេសកកម្ម ចក្ខុវិស័យ និងគុណតម្លៃ",
                "paragraphs": [
                    "បេសកកម្ម៖ យើងជឿជាក់ថា បច្ចេកវិទ្យាគឺជាស្ពានចម្លងចំណេះដឹងដ៏មានប្រសិទ្ធភាពបំផុត។ តាមរយៈការធ្វើទំនើបកម្មប្រព័ន្ធអប់រំចរាចរណ៍ទៅជាទម្រង់ឌីជីថល គម្រោងរបស់យើងបានលុបបំបាត់របាំងនៃទីកន្លែង និងពេលវេលា។ សិស្សគ្រប់រូបអាចស្វែងយល់ពីទ្រឹស្ដី និងសញ្ញាចរាចរណ៍ពីរភាសាយ៉ាងងាយស្រួលត្រឹមចុងម្រាមដៃ ឱ្យតែមានការតភ្ជាប់អ៊ីនធឺណិត ដែលនេះជាគ្រឹះដ៏សំខាន់ក្នុងការកាត់បន្ថយគ្រោះថ្នាក់ និងបង្កើតវប្បធម៌បើកបរប្រកបដោយការទទួលខុសត្រូវនៅកម្ពុជា។",
                    "ចក្ខុវិស័យ៖ ការចាក់គ្រឹះនៃវប្បធម៌បើកបរប្រកបដោយស្មារតីទទួលខុសត្រូវ និងចំណេះដឹងច្បាស់លាស់នៅកម្ពុជា រួមជាមួយការបើកទំព័រថ្មីសម្រាប់យុវនារីសាលាវត្តអារាម ក្នុងការបង្ហាញសក្តានុពលពិតប្រាកដ ជាអ្នកដឹកនាំបច្ចេកវិទ្យា និងជាអ្នកបង្កើតពិភពឌីជីថល។",
                    "គុណតម្លៃ៖ ដំណោះស្រាយឌីជីថលទ្វិភាសា (ខ្មែរ-អង់គ្លេស) ដែលឆ្លើយតបចំតម្រូវការសិស្ស ផ្អែកលើភាពងាយស្រួល និងភាពត្រឹមត្រូវកម្រិតខ្ពស់។ យើងប្រើប្រាស់បច្ចេកវិទ្យាជាកម្លាំងចលករក្នុងការបើកឱកាសសិក្សា ប្រកបដោយការប្តេជ្ញាចិត្តយ៉ាងមុតមាំក្នុងការចូលរួមសម្រេចគោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព (SDG) របស់អង្គការសហប្រជាជាតិ គឺការធានា «ការអប់រំប្រកបដោយគុណភាព (SDG 4)» និងការចូលរួមកសាង «ទីក្រុង និងសហគមន៍ប្រកបដោយចីរភាព (SDG 11)»។"
                ]
            },
            {
                "heading": "សមាជិកក្រុម និងគ្រូណែនាំ",
                "paragraphs": [
                    "១. ដាណៃ យីន (DANAI YIN) — អ្នកអានសំលេង · អ្នកដឹកនាំក្រុម (Voice Reading · Team Lead), អាយុ ១២ ឆ្នាំ។ ជីវប្រវត្តិ៖ និស្សិតអភិវឌ្ឍន៍ដែលចូលចិត្តដោះស្រាយបញ្ហាសហគមន៍ដោយប្រើបច្ចេកវិទ្យា។",
                    "២. ចន្ថា កានិកា (CHANTHA KANIKA) — មាតិការ និងការស្រាវជ្រាវ (Content & Research), អាយុ ១៣ ឆ្នាំ។ ជីវប្រវត្តិ៖ អ្នកគិតច្នៃប្រឌិតដែលផ្តោតលើបទពិសោធន៍អ្នកប្រើប្រាស់និងការរចនាកម្មវិធី។",
                    "៣. រ៉ូហ្សា ន័ន (ROZA NEUN) — រចនា UI/UX (UI/UX Design), អាយុ ១១ ឆ្នាំ។ ជីវប្រវត្តិ៖ អ្នករៀនដ៏ចំណាន ដែលស្វែងយល់ពី AI និងគំនិតការរៀនម៉ាស៊ីន។",
                    "៤. លីន ម៉ានី (LIN MANY) — ធានាគុណភាព និងតេស្ត (QA & Testing), អាយុ ១៣ ឆ្នាំ។ ជីវប្រវត្តិ៖ អ្នកស្រាវជ្រាវក្រុមនិងអ្នកវិភាគទិន្នន័យដែលមានជំនាញដោះស្រាយបញ្ហាខ្លាំង។",
                    "៥. សុន រុណម៉ារ៉ា (SUN RUNAMARA) — ធានាគុណភាព និងតេស្ត (QA & Testing), អាយុ ១១ ឆ្នាំ។ ជីវប្រវត្តិ៖ ចូលចិត្តបង្កើតកម្មវិធីដែលបង្កើតភាពខុសគ្នានៅក្នុងសហគមន៍។",
                    "៦. ភាព ពិសិដ្ឋ (PHEAP PISETH) — គ្រូបង្រៀន · អ្នកដឹកនាំកម្មវិធី (Teacher · Program Lead)។ ជីវប្រវត្តិ៖ ខ្ញុំមានឈ្មោះថា ភាព ពិសិដ្ឋ ជាគ្រូបង្រៀនថ្នាក់វិទ្យាសាស្ត្រគណិតវិទ្យា និងរូបវិទ្យានៅក្នុងខេត្តសៀមរាប ជួយសម្របសម្រួល និងណែនាំក្រុម Kesararam With Digital តាមរយៈកម្មវិធី Technovation Girls។",
                    "៧. ស្រុី វី (SHILIAIWEI) — គ្រូណែនាំ (Mentor)។ ជីវប្រវត្តិ៖ និស្សិតសាកលវិទ្យាល័យដែលជំនាញក្នុងការរចនា ការគ្រប់គ្រងបច្ទេសទេស និងការគ្រប់គ្រងគម្រោង។"
                ]
            }
        ]
    },
    "brand": {
        "filename_prefix": "KWD_Brand_Guidelines_Khmer_v2",
        "title": "គោលការណ៍ណែនាំម៉ាកយីហោ (Brand Guidelines)",
        "subtitle": "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD — Kesararam With Digital",
        "sections": [
            {
                "heading": "១. ឈ្មោះ Brand និងអត្ថន័យ",
                "paragraphs": [
                    "KWD មានន័យថា Kesararam With Digital — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍របស់យើង។",
                    "ពាក្យ With មិនមែនជាឈ្នាប់វាក្យសព្ទធម្មតានោះទេ វាប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ ឌីជីថល (Digital) មិនមែនត្រឹមតែជាឧបករណ៍សម្រាប់ផ្សព្វផ្សាយនោះទេ — ប៉ុន្តែវាគឺជាការប្តេជ្ញាចិត្តក្នុងការផ្តល់ជូននូវឱកាសចូលរៀន (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។",
                    "KWD ត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរនៃសាលាបឋមសិក្សាកេសរារាម ក្រោមទស្សនវិស័យមួយថា៖ ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍ដែលសង្គ្រោះជីវិតមនុស្ស គួរតែត្រូវបានផ្តល់ជូនដោយឥតគិតថ្លៃ មានលក្ខណៈអន្តរកម្ម និងងាយស្រួលចូលប្រើប្រាស់ជាភាសាកំណើតរបស់សិស្សគ្រប់រូប។ ឈ្មោះនេះបញ្ជាក់ឱ្យឃើញថា ការអប់រំមិនបានបោះបង់ចោលអត្តសញ្ញាណ និងឫសគល់វប្បធម៌នៅក្នុងយុគសម័យឌីជីថលនោះទេ ប៉ុន្តែវាគឺជាការជំរុញឱ្យឫសគល់ទាំងនោះ កាន់តែរីកចម្រើនទៅមុខតាមបច្ចេកវិទ្យា។",
                    "ការណែនាំ៖ ត្រូវប្រើឈ្មោះពេញ «Kesararam With Digital» សម្រាប់ការណែនាំម៉ាកយីហោលើកដំបូងក្នុងកម្មវិធីសារព័ត៌មាន បទបង្ហាញ ឯកសារផ្លូវការ និងដៃគូសហការ។ លោកអ្នកអាចប្រើពាក្យកាត់ «KWD» នៅផ្នែកបន្ទាប់ ក្រោយពេលដែលបានបង្ហាញឈ្មោះពេញរួច។"
                ]
            },
            {
                "heading": "២. និមិត្តសញ្ញា (Logo) និងអត្ថន័យ",
                "paragraphs": [
                    "និមិត្តសញ្ញាផ្លេកបន្ទោរនៅលើឡូហ្គោ KWD មិនមែនជាការតុបតែងលម្អឡើយ តែវាជាទស្សនវិជ្ជាស្នូលរបស់ Brand។ វាផ្ដល់អត្ថន័យដល់ Flash Learning ដោយឈរលើជំនឿថា ក្នុងយុគសម័យ AI ចំណេះដឹងត្រូវតែដើរក្នុងល្បឿននៃពន្លឺ។ ស្របពេលដែល Automation កំពុងផ្លាស់ប្ដូររាល់ឧស្សាហកម្ម បច្ចេកវិទ្យានៃអនាគតជារបស់អ្នកដែលរៀនសូត្រនៅថ្ងៃនេះ។ និមិត្តសញ្ញានេះជាការប្ដេជ្ញាចិត្តរបស់ Kesararam With Digital ក្នុងការផ្ដល់នូវល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីសិក្សារួមគ្នាជាមួយ AI និងដឹកនាំការផ្លាស់ប្ដូរនាពេលខាងមុខ។",
                    "ឡូហ្គោផ្លូវការគឺ kwd-black_nobackground.png ដែលមានពណ៌ខ្មៅនៅលើផ្ទៃថ្លា។",
                    "ច្បាប់នៃការប្រើប្រាស់ឡូហ្គោ៖",
                    "• កុំទាញ, បង្វិល ឬធ្វើឱ្យ logo ខូចទ្រង់ទ្រាយ។",
                    "• កុំដាក់ស្រមោល (shadow), gradient ឬ filter លើ logo។",
                    "• កុំដាក់ logo លើ background ដែលមាន contrast ទាប។",
                    "• រក្សាទុកចន្លោះទំនេរជុំវិញ logo ស្មើកម្ពស់អក្សរ K ។",
                    "• ប្រើប្រាស់ kwd-black_nobackground លើ background ភ្លឺប៉ុណ្ណោះ។ ប្រើប្រាស់ឡូហ្គោពណ៌ស (Inverted) លើ background ងងឹត។",
                    "• ឡូហ្គោត្រូវមានកម្ពស់យ៉ាងតិច ២៤ ភីកសែល ក្នុងកម្មវិធីឌីជីថលណាក៏ដោយ។",
                    "• កុំផ្លាស់ប្ដូរពណ៌ ឬបន្ថែម outline លើឡូហ្គោតាមចិត្តចង់ឡើយ។"
                ]
            },
            {
                "heading": "៣. ក្ដារពណ៌ (Color Palette)",
                "paragraphs": [
                    "• Yellow (#eab308)៖ ពណ៌សម្រាប់ប៊ូតុង CTA, សញ្ញាព្រមាន និងពណ៌លេចធ្លោរបស់ម៉ាក (brand accent)។",
                    "• Black (#000000)៖ ពណ៌សម្រាប់អក្សរ, គែម (borders) និងរចនាសម្ព័ន្ធ។",
                    "• White (#ffffff)៖ ពណ៌សម្រាប់ផ្ទៃខាងក្រោយ និងចន្លោះទំនេរ (negative space)។",
                    "• Blue (#3b82f6)៖ ពណ៌សម្រាប់សញ្ញាព័ត៌មាន, តំណភ្ជាប់ និងសញ្ញាវិជ្ជមាន។",
                    "• Red (#ef4444)៖ ពណ៌សម្រាប់សញ្ញាហាមឃាត់, សញ្ញាឈប់ និងសញ្ញាគ្រោះថ្នាក់។",
                    "• Green (#22c55e)៖ ពណ៌សម្រាប់សញ្ញាអនុញ្ញាត ស្ថានភាពជោគជ័យ និងសញ្ញាទៅមុខ។",
                    "• Orange (#f97316)៖ ពណ៌សម្រាប់ការប្រុងប្រយ័ត្ន និងការផ្ដោតអារម្មណ៍។",
                    "• Purple (#a855f7)៖ ពណ៌សម្រាប់មុខងារពិសេស (Premium features) និងរបៀបលេងហ្គេមផ្សេងៗ។"
                ]
            },
            {
                "heading": "៤. អក្សរ (Typography)",
                "paragraphs": [
                    "• ហ្វុនត៍ភាសាខ្មែរ៖ ប្រើប្រាស់ហ្វុនត៍ Siemreap ឬ Battambang សម្រាប់ការបង្ហាញខ្លឹមសារអក្សរខ្មែរទាំងអស់នៅក្នុងប្រព័ន្ធ ដើម្បីធានាបាននូវការអានងាយស្រួល រក្សាបាននូវសោភ័ណភាព និងភាពច្បាស់លាស់ខ្ពស់។",
                    "• ហ្វុនត៍ភាសាអង់គ្លេស៖ ប្រើប្រាស់ហ្វុនត៍ Inter សម្រាប់អក្សរឡាតាំងទាំងអស់ ស្លាកបញ្ជា UI headings និង body copy ។"
                ]
            }
        ]
    }
}

# ----------------------------------------------------------------------
# 2. FONT REGISTRATION FOR PDF (ReportLab)
# ----------------------------------------------------------------------

def register_khmer_fonts():
    regular_font_path = None
    bold_font_path = None
    
    font_candidates_regular = [
        "/Library/Fonts/KhmerOSBattambang-Regular.ttf",
        "/Library/Fonts/KhmerOS_battambang.ttf",
        "/Library/Fonts/KhmerOS.ttf",
        "/Library/Fonts/NotoSansKhmer-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Khmer Sangam MN.ttf"
    ]
    
    font_candidates_bold = [
        "/Library/Fonts/KhmerOSBattambang-Bold.ttf",
        "/Library/Fonts/NotoSansKhmer-Bold.ttf",
        "/Library/Fonts/KhmerOSBattambang-Regular.ttf"
    ]
    
    for path in font_candidates_regular:
        if os.path.exists(path):
            regular_font_path = path
            break
            
    for path in font_candidates_bold:
        if os.path.exists(path):
            bold_font_path = path
            break
            
    if regular_font_path:
        print(f"Registering Regular Font: {regular_font_path}")
        pdfmetrics.registerFont(TTFont("KhmerRegular", regular_font_path))
    else:
        print("Warning: Regular Khmer font not found. Using standard Helvetica fallback.")
        pdfmetrics.registerFont(TTFont("KhmerRegular", "Helvetica"))
        
    if bold_font_path:
        print(f"Registering Bold Font: {bold_font_path}")
        pdfmetrics.registerFont(TTFont("KhmerBold", bold_font_path))
    else:
        print("Warning: Bold Khmer font not found. Using standard Helvetica-Bold fallback.")
        pdfmetrics.registerFont(TTFont("KhmerBold", "Helvetica-Bold"))

# ----------------------------------------------------------------------
# 3. FORMAT GENERATORS
# ----------------------------------------------------------------------

def generate_txt(filepath, title, subtitle, sections):
    print(f"Writing Text to: {filepath}")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write(f" {title}\n")
        f.write(f" {subtitle}\n")
        f.write("=" * 80 + "\n\n")
        
        for sec in sections:
            if sec["heading"]:
                f.write(f"## {sec['heading']}\n\n")
            for para in sec["paragraphs"]:
                f.write(f"{para}\n\n")
            f.write("-" * 40 + "\n\n")

def generate_docx(filepath, title, subtitle, sections):
    print(f"Writing DOCX to: {filepath}")
    doc = docx.Document()
    
    # Configure A4 margins
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    
    # Base styling
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Khmer OS Battambang'
    font.size = Pt(11)
    
    # Title
    title_p = doc.add_paragraph()
    title_run = title_p.add_run(title)
    title_run.font.name = 'Khmer OS Siemreap'
    title_run.font.size = Pt(22)
    title_run.bold = True
    title_p.paragraph_format.space_after = Pt(4)
    
    # Subtitle
    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run(subtitle)
    sub_run.font.name = 'Khmer OS Battambang'
    sub_run.font.size = Pt(10)
    sub_run.italic = True
    sub_p.paragraph_format.space_after = Pt(20)
    
    # Divider line
    div_p = doc.add_paragraph()
    div_p.add_run("―" * 60)
    div_p.paragraph_format.space_after = Pt(20)
    
    for sec in sections:
        if sec["heading"]:
            head_p = doc.add_paragraph()
            head_run = head_p.add_run(sec["heading"])
            head_run.font.name = 'Khmer OS Siemreap'
            head_run.font.size = Pt(14)
            head_run.bold = True
            head_p.paragraph_format.space_before = Pt(14)
            head_p.paragraph_format.space_after = Pt(6)
            
        for para in sec["paragraphs"]:
            p = doc.add_paragraph()
            p_run = p.add_run(para)
            p_run.font.name = 'Khmer OS Battambang'
            p_run.font.size = Pt(11)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.line_spacing = 1.15
            
    doc.save(filepath)

def generate_pdf(filepath, title, subtitle, sections):
    print(f"Writing PDF to: {filepath}")
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'KhmerTitle',
        parent=styles['Normal'],
        fontName='KhmerBold',
        fontSize=20,
        leading=26,
        spaceAfter=8,
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'KhmerSubtitle',
        parent=styles['Normal'],
        fontName='KhmerRegular',
        fontSize=9.5,
        leading=13,
        textColor='#52525b',
        spaceAfter=18,
        alignment=TA_LEFT
    )
    
    heading_style = ParagraphStyle(
        'KhmerHeading',
        parent=styles['Normal'],
        fontName='KhmerBold',
        fontSize=13,
        leading=17,
        spaceBefore=14,
        spaceAfter=6,
        alignment=TA_LEFT
    )
    
    body_style = ParagraphStyle(
        'KhmerBody',
        parent=styles['Normal'],
        fontName='KhmerRegular',
        fontSize=10,
        leading=15,
        spaceAfter=8,
        alignment=TA_LEFT
    )
    
    story = []
    
    # Title
    story.append(Paragraph(title, title_style))
    # Subtitle
    story.append(Paragraph(subtitle, subtitle_style))
    # Divider line
    story.append(Paragraph("<font color='#d4d4d8'>__________________________________________________________________________________</font>", body_style))
    story.append(Spacer(1, 15))
    
    for sec in sections:
        if sec["heading"]:
            story.append(Paragraph(sec["heading"], heading_style))
        for para in sec["paragraphs"]:
            story.append(Paragraph(para, body_style))
            
    doc.build(story)

# ----------------------------------------------------------------------
# 4. MAIN CONTROLLER
# ----------------------------------------------------------------------

def main():
    dest_dir = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/docs"
    os.makedirs(dest_dir, exist_ok=True)
    
    register_khmer_fonts()
    
    print("\n--- Generating Legal & Branding Documents in Khmer ---")
    for key, doc_data in DOCUMENTS.items():
        prefix = doc_data["filename_prefix"]
        title = doc_data["title"]
        subtitle = doc_data["subtitle"]
        sections = doc_data["sections"]
        
        txt_path = os.path.join(dest_dir, f"{prefix}.txt")
        docx_path = os.path.join(dest_dir, f"{prefix}.docx")
        pdf_path = os.path.join(dest_dir, f"{prefix}.pdf")
        
        generate_txt(txt_path, title, subtitle, sections)
        generate_docx(docx_path, title, subtitle, sections)
        generate_pdf(pdf_path, title, subtitle, sections)
        
        print(f"Successfully finished all three formats for: {key}\n")
        
    print("Done! All 12 document formats generated and saved inside 'docs/' directory.")

if __name__ == "__main__":
    main()
