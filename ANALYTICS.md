# MeetUp App - Usage Analytics

Simple usage tracking without authentication for MVP testing.

## What's Tracked

The system automatically logs:
1. **Session Created** - When a driver creates a new session
2. **Session Joined** - When a passenger joins
3. **Session Completed** - When users click "We Met!"

## Analytics Endpoints

All endpoints are at: `http://your-backend-url/v1/analytics/`

### 1. Get Overall Statistics

```bash
GET /v1/analytics/stats
```

**Response:**
```json
{
  "total": {
    "sessions": 156,
    "joins": 142,
    "completions": 138
  },
  "today": {
    "sessions": 12,
    "joins": 11,
    "completions": 10
  },
  "last7Days": [
    {
      "date": "2026-01-09",
      "sessions": 12,
      "joins": 11,
      "completions": 10
    },
    {
      "date": "2026-01-08",
      "sessions": 15,
      "joins": 14,
      "completions": 13
    }
    // ... 5 more days
  ]
}
```

### 2. Get Recent Events

```bash
GET /v1/analytics/events?limit=50
```

**Response:**
```json
{
  "events": [
    {
      "type": "session_created",
      "code": "ABC123",
      "driverName": "John",
      "timestamp": 1736424000000,
      "date": "2026-01-09"
    },
    {
      "type": "session_joined",
      "code": "ABC123",
      "timestamp": 1736424120000,
      "date": "2026-01-09"
    }
  ],
  "count": 50
}
```

### 3. Detect Unusual Activity

```bash
GET /v1/analytics/anomalies
```

**Response (Normal):**
```json
{
  "suspiciousActivity": false
}
```

**Response (Suspicious):**
```json
{
  "suspiciousActivity": true,
  "reason": "Unusual spike in session creation",
  "details": {
    "todaySessions": 50,
    "averageLast7Days": 8,
    "increaseMultiple": 6
  }
}
```

### 4. Get Complete Dashboard

```bash
GET /v1/analytics/dashboard
```

**Response:**
```json
{
  "stats": { /* stats object */ },
  "recentEvents": [ /* last 50 events */ ],
  "anomalies": { /* anomaly detection */ },
  "timestamp": "2026-01-09T15:30:00.000Z"
}
```

## What This Tells You

### Growth Signals ✅

**Organic Growth:**
- Steady increase in sessions day-over-day
- Joins closely match sessions (good conversion)
- Completions close to joins (users meeting successfully)

**Viral Spread (Drivers sharing link):**
- Sudden spike in sessions (5x+ normal)
- Multiple sessions in short time (>10/hour)
- New driver names appearing

**Good Metrics:**
```
Sessions: 100
Joins: 95 (95% conversion - excellent!)
Completions: 90 (95% success rate - great!)
```

### Warning Signs ⚠️

**Unauthorized Sharing:**
- Sudden 5x-10x spike in sessions
- Many sessions from unknown drivers
- Anomaly detection triggers

**Technical Issues:**
- Sessions created but not joined (0% conversion)
- Joins but no completions (users can't meet)
- Events missing

## Example Usage

### Check Daily Stats (Command Line)

```bash
# Linux/Mac
curl http://your-backend-url/v1/analytics/stats | json_pp

# Windows PowerShell
Invoke-RestMethod http://your-backend-url/v1/analytics/stats | ConvertTo-Json

# Or just open in browser:
http://your-backend-url/v1/analytics/dashboard
```

### Monitor Viral Spread

```bash
# Check for anomalies
curl http://your-backend-url/v1/analytics/anomalies

# If suspicious, see recent events
curl "http://your-backend-url/v1/analytics/events?limit=100"
```

### Weekly Review

```bash
# Get dashboard data
curl http://your-backend-url/v1/analytics/dashboard > analytics-report.json

# Look for:
# 1. Total sessions vs last week
# 2. Completion rate (completions/joins)
# 3. Any anomaly alerts
# 4. New driver names in events
```

## Building a Simple Dashboard

You can create an HTML dashboard to view this:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MeetUp Analytics</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .metric { display: inline-block; margin: 20px; padding: 20px; background: #f0f0f0; border-radius: 8px; }
    .metric h3 { margin: 0 0 10px 0; }
    .metric .value { font-size: 32px; font-weight: bold; color: #2563eb; }
    .chart { margin: 20px 0; }
  </style>
</head>
<body>
  <h1>MeetUp Usage Analytics</h1>
  <div id="stats"></div>
  <div id="anomalies"></div>
  <div id="events"></div>

  <script>
    const API_URL = 'http://your-backend-url/v1/analytics';

    async function loadDashboard() {
      const response = await fetch(`${API_URL}/dashboard`);
      const data = await response.json();

      // Display stats
      document.getElementById('stats').innerHTML = `
        <div class="metric">
          <h3>Total Sessions</h3>
          <div class="value">${data.stats.total.sessions}</div>
        </div>
        <div class="metric">
          <h3>Today</h3>
          <div class="value">${data.stats.today.sessions}</div>
        </div>
        <div class="metric">
          <h3>Success Rate</h3>
          <div class="value">${Math.round(data.stats.total.completions / data.stats.total.joins * 100)}%</div>
        </div>
      `;

      // Display anomalies
      if (data.anomalies.suspiciousActivity) {
        document.getElementById('anomalies').innerHTML = `
          <div style="background: #fee; padding: 15px; border-radius: 8px; border-left: 4px solid #c00;">
            <h3>⚠️ ${data.anomalies.reason}</h3>
            <pre>${JSON.stringify(data.anomalies.details, null, 2)}</pre>
          </div>
        `;
      }

      // Display recent events
      const eventsHtml = data.recentEvents.slice(0, 10).map(e => `
        <div>${e.date} ${new Date(e.timestamp).toLocaleTimeString()} - ${e.type} ${e.driverName || ''} (${e.code})</div>
      `).join('');
      document.getElementById('events').innerHTML = `<h3>Recent Events</h3>${eventsHtml}`;
    }

    loadDashboard();
    setInterval(loadDashboard, 60000); // Refresh every minute
  </script>
</body>
</html>
```

## Data Retention

- Events: 90 days
- Daily counters: 90 days
- Total counters: Forever

## Privacy & Security

**For MVP (No Auth):**
- ✅ No personal data stored (just driver names from sessions)
- ✅ No IP addresses or device info
- ✅ Session codes are anonymized
- ✅ Data auto-expires after 90 days

**When Adding Auth Later:**
- Store company ID with events
- Add API key validation
- Restrict analytics endpoints
- Per-company dashboards

## Next Steps

### Phase 1 (Current - MVP):
- ✅ Track usage automatically
- ✅ Monitor for viral spread
- ✅ Detect unauthorized sharing

### Phase 2 (After Successful MVP):
- Add simple password protection to analytics endpoints
- Create web dashboard
- Email weekly reports

### Phase 3 (B2B Product):
- Implement API key system
- Per-company analytics
- Billing integration
- Rate limiting

## Quick Start

1. **Deploy your app** (analytics is already integrated)
2. **Check stats:**
   ```
   http://your-backend-url/v1/analytics/stats
   ```
3. **Monitor daily** for growth signals
4. **Check anomalies** if you see unexpected usage

That's it! No configuration needed - it's tracking automatically.
