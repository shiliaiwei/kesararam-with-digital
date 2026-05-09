# Category URL Mapping Implementation

## Overview
Updated the Save Card feature to support all 8 learning categories with dynamic URL generation based on the sign's sub_group.

## Implementation Details

### File Modified
- `kesararam/src/components/learn/save-card-button.tsx`

### Category Mapping (All 8 Categories)

#### 1. Road Sign (`road-sign`)
- Prohibitory Signs
- Mandatory Signs
- Priority Signs
- Warning Signs
- Temporary Signs
- Direction Signs
- Buildup Area Boundary Signs
- Street Name Signs
- Informative Signs
- Supplementary Signs
- Sign Posts
- Transverse Markings
- Longitudinal Markings
- Arrows Markings
- Other Road Markings
- Traffic Lights
- Traffic Police Signals

#### 2. Road Traffic (`road-traffic`)
- Traffic Rules
- Speed Limits
- Parking
- Overtaking

#### 3. Priority (`priority`)
- Intersections
- Roundabouts
- Pedestrian Crossings

#### 4. Driving (`driving`)
- Basic Maneuvers
- Advanced Techniques
- Defensive Driving

#### 5. Technical (`technical`)
- Engine
- Brakes
- Lights
- Safety Systems

#### 6. Loading People Goods (`loading-people-goods`)
- Weight Limits
- Passenger Safety
- Cargo Securing

#### 7. General Knowledge (`general-knowledge`)
- Road Safety
- Environmental
- Legal

#### 8. Emergency (`emergency`)
- Accidents
- Breakdowns
- First Aid
- Emergency Contacts

## URL Generation

When a user saves a card, the URL displayed on the image will be:
```
kesararamwithdigital.tech/learn/{categorySlug}
```

### Examples
- Road Sign: `kesararamwithdigital.tech/learn/road-sign`
- Road Traffic: `kesararamwithdigital.tech/learn/road-traffic`
- Priority: `kesararamwithdigital.tech/learn/priority`
- Driving: `kesararamwithdigital.tech/learn/driving`
- Technical: `kesararamwithdigital.tech/learn/technical`
- Loading People Goods: `kesararamwithdigital.tech/learn/loading-people-goods`
- General Knowledge: `kesararamwithdigital.tech/learn/general-knowledge`
- Emergency: `kesararamwithdigital.tech/learn/emergency`

## Features

✅ **Dynamic URL Mapping**: URL changes based on the sign's category
✅ **All 8 Categories Supported**: Complete mapping for all learning categories
✅ **Fallback**: Defaults to 'road-sign' if category is not found
✅ **Bilingual Support**: Works with both English and Khmer language settings
✅ **Branded Filename**: Saves as `{SIGN_CODE}-KWD.png`

## Testing

To test the feature:
1. Navigate to the Traffic Signs Catalogue
2. Click on a sign from different categories
3. Click "Save Card" button
4. Verify the generated image shows the correct category URL
5. Check that the URL matches the sign's category

## Promotional Text

The save card includes the following promotional text (in gray):
- **English**: "Learn traffic signs, build safety knowledge for life - kesararamwithdigital.tech"
- **Khmer**: "រៀនសញ្ញាចរាចរណ៍ បង្កើតចំណេះដឹងសុវត្ថិភាពពេញមួយជីវិត - kesararamwithdigital.tech"

This text emphasizes learning and safety, appealing to kids and families.

## Implementation Status

✅ **Complete** - All 8 categories are now properly mapped to their respective URLs
