# Vercel Environment Variables - Copy These Exactly

## ⚠️ IMPORTANT: Add these 2 missing variables to Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

---

## Variable 1: Service Account Email

**Name:**
```
GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL
```

**Value:**
```
kwd-900@kwd2026.iam.gserviceaccount.com
```

**Environments:** ✓ Production ✓ Preview ✓ Development

---

## Variable 2: Private Key

**Name:**
```
GOOGLE_DRIVE_PRIVATE_KEY
```

**Value:** (Copy the ENTIRE text below, including BEGIN and END lines)

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDtC9qYwwWmQAjQ
py6NdhVmJywS8hYUzgrTE1ikbwk+AnbI0JBozaTaW4PYTxoIWVAyousjCEEWPddZ
9T/Br2jOtqzNiEKlqmYZwCEkvzV9mXw8PV4+xtiI8TGHXv876PdIN+DejWshfZ5n
zb58mJduUGpxqX3Jx6t2EV06WZrUb1czqHo2Sp78T2LYc2iochY+jyYniNk87aRv
EwB+HVL4+D4aQF/i44KY/5Plp+I4bguPob8tlmWG7GPjQCtMYCYd0A/iLDAKXGnS
4piRpyquV/qOFtdR4JA4LsSYSJOta1JjilXmKWv9Ky1P0/zpcwtB1YF+G87DQf/H
D89wMcMHAgMBAAECggEAAkESRTSC5uia+xOkz1p2AWl1up1ISnk/IOIPb9je6RLT
0FlIudSizT9ypzC4faecqfW4Nu8uYe/f8kdi4bcxbEpB+xdEvaXmLnBI9bwqbCqR
J4u4EylrXYEgVqv+tLIkj9sju72eF75wZ03brt/dDFhI+tlIGtV0QS8Q3choImjK
LjN9CToWZrIRTA2LHZXRuqPwKjRrLNWvKVnk62lOFJfOUTBI5Gcf9uJA+wwTYk2z
zFLChhdbwM+8F2WyNLKLrB90vCyLLNBuxb48ZM8M+d1qmYw96dEkeG0Hwlvv/fQY
gs+OLqzf5E8wEy8E+OMt6G5suRqLXxBXqX1XhYo8CQKBgQD9GJWCCjvffd1J8B0R
jOYbEnx1qcp9aQjQfX6XEb1+UjOmf2Y1Z5anQH3ksAgdeQHGFNiOy5YdNolNyPKH
2DrpHhVJbZI8ToEPfF+wzleDog0zIw5s/rWzSJchIJTV+Ps7ePGyKflij/7sy0aR
nwdhhVEjzMR9GHLbouUF8V7ENQKBgQDvxCCQdLZ+i3GByV3wUSfxrC/XurVZKvF4
1HAbeuMexMFMHfWne8uWeFHojDo5EVAdZXh3pNJ6LOf8rBOQTi7agUwQIo+42NFA
46ziZ5KmiPV3vmSDCcD+tHbWhElj7aKydBXKNPnPhhsR8sg7XD/i2zAkA4WWG2LP
l4u5S7cZywKBgQDeuOuYa/kUS2aY0jxCXYOA/1uXD7upcOzYzBbCSlI+/4eEVUhU
Zrwkopom0uHRTdNJxL5tqqqHOp7JXLRQ5u+whVCmNU4i09KvFfv/UxWgONL01Ty0
ndC33IFiHZHcWiZ7x4qqBlX3blAfgSKwswmDwBYPMvsWOpWYwlhYSnfioQKBgC/W
nfi0kMTm5ZrTpp6QUrvxcwpEAnLsEondORECj9ZPw5GAWMc1+ATptM4FTIieX7G9
0S9t/2DJHPBZFP4x2z9VlOuTOcHT4MxloNT7fVMk+HUP09YhWBR5xUw/0LTTcSbR
6pcRwtYZF8WY/0J4wXZt7UkCOuEcTbbFseciqEHJAoGAAzmZ3CvZkd05In6UUHS8
UhUMCul5haSosVX7DRLrQ7rgj0ZZEm64b20TBeLmb0XZEPQ7uowwT+QhMG8au3q3
VXeeJwrVmNSZYSKMNpYQMZKRzpsahJj1PXEQaiKoBLfViX3QvR5X/iynL1AvLB9x
rEB80dqRNWGvtUt92Y/5rQo=
-----END PRIVATE KEY-----
```

**Environments:** ✓ Production ✓ Preview ✓ Development

---

## After Adding Both Variables:

1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click latest deployment → **⋯** → **Redeploy**
4. Wait for deployment (~2 minutes)
5. Test: Visit `https://kesararamwithdigital.tech/api/media/google-drive/test`
6. Should see all three as `true`
7. Then visit: `https://kesararamwithdigital.tech/staff/google-drive`

---

## ✅ Current Status:

- ❌ GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL - **MISSING - ADD THIS**
- ❌ GOOGLE_DRIVE_PRIVATE_KEY - **MISSING - ADD THIS**
- ✅ GOOGLE_DRIVE_MEDIA_FOLDER_ID - Already set correctly

---

## 💡 Tips:

- Copy the private key exactly as shown (with line breaks)
- Don't add extra spaces or quotes
- Make sure to select all 3 environments (Production, Preview, Development)
- Redeploy after adding variables for changes to take effect
