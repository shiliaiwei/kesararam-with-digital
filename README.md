## Profile Management Architecture

### User Role-Based Profile Types

**Admin & Teacher Profiles**

- Feature: Face Expression Avatar (customizable facial expressions)
- Access: Profile editing, settings management, view info panel
- Dropdown menu structure:
  - Edit Profile
  - View Info
  - Settings
  - Logout

**Student Profiles**

- Feature: Standard Avatar (non-expression based)
- Access: Limited profile customization
- Dropdown menu structure:
  - View Profile
  - Settings
  - Logout

### Edit Profile Dropdown Menu (Neo-Brutalist)

```
┌─────────────────────┐
│ Edit Profile        │ ← border-2 border-[#a8a8a8]
│ View Info           │   shadow-[4px_4px_0_#000]
│ Settings            │
│ ─────────────────── │
│ Logout              │
└─────────────────────┘
```

- **Border**: `border-2 border-[#a8a8a8]`
- **Shadow**: `shadow-[4px_4px_0_#000]`
- **Divider**: Solid line separating logout action
- **Hover State**: `bg-[#eab308]` (traffic-light yellow)

### Customization Fields

**For Admin/Teacher**: Face, expression, hair/head styling
**For Student**: Avatar selection only
