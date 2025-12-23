# Location Codes Reference

## Available Location Codes

| Location | Code | Usage Example |
|----------|------|---------------|
| **Dar Es Salaam** | `DSM` | `?from=DSM&to=ARK` |
| **Arusha** | `ARK` | `?from=DSM&to=ARK` |
| **Morogoro** | `MRO` | `?from=DSM&to=MRO` |
| **Moshi** | `MSH` | `?from=DSM&to=MSH` |
| **Dodoma** | `DOD` | `?from=DSM&to=DOD` |
| **Turiani** | `TUR` | `?from=TUR&to=DSM` |

## Search Methods

You can search using **any** of these methods:

### 1. Location Codes (Recommended)
```
GET /api/v1/trips/search?from=DSM&to=ARK&date=2025-12-23
GET /api/v1/trips/search?from=dsm&to=ark&date=2025-12-23  (case-insensitive)
```

### 2. Full Location Names
```
GET /api/v1/trips/search?from=Dar Es Salaam&to=Arusha&date=2025-12-23
GET /api/v1/trips/search?from=dar es salaam&to=arusha&date=2025-12-23  (case-insensitive)
```

### 3. Partial Names
```
GET /api/v1/trips/search?from=Dar&to=Aru&date=2025-12-23
GET /api/v1/trips/search?from=Moro&to=Aru&date=2025-12-23
```

### 4. Common Abbreviations
The system automatically handles:
- `Dar` → `Dar Es Salaam`

## Get All Locations

To get a complete list of all available locations and routes:

```http
GET /api/v1/locations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "name": "Arusha",
        "code": "ARK"
      },
      {
        "name": "Dar Es Salaam",
        "code": "DSM"
      }
      // ... more locations
    ],
    "routes": [
      {
        "from": "Dar Es Salaam",
        "fromCode": "DSM",
        "to": "Arusha",
        "toCode": "ARK",
        "routeString": "Dar Es Salaam (DSM) → Arusha (ARK)"
      }
      // ... more routes
    ],
    "totalLocations": 6,
    "totalRoutes": 6
  }
}
```

## Error Handling

If you search for an invalid route, the API will return helpful suggestions:

```json
{
  "success": false,
  "message": "No route found for this journey",
  "hint": "Use location codes (e.g., DSM, ARK) or full names (e.g., Dar Es Salaam, Arusha)",
  "data": {
    "searchedFrom": "Invalid",
    "searchedTo": "Place",
    "availableRoutes": [
      {
        "from": "Dar Es Salaam (DSM)",
        "to": "Arusha (ARK)"
      }
      // ... all available routes
    ]
  }
}
```

## Tips

1. **Use codes for faster searches**: `DSM` is quicker than typing `Dar Es Salaam`
2. **Case doesn't matter**: `dsm`, `DSM`, `Dsm` all work
3. **Date format**: Use `YYYY-MM-DD` (e.g., `2025-12-23`)
4. **Current trips**: Seeded trips are for the next 7 days from today
