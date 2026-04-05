path = 'v:/kesararamwithdigital/src/components/learn/sign-detail-popup.tsx'
content = open('v:/kesararamwithdigital/scripts/popup-content.txt', 'r', encoding='utf-8').read()
open(path, 'w', encoding='utf-8').write(content)
print('written', len(content), 'chars')
