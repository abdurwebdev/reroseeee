# Server Scripts

This directory contains utility scripts for the server.

## Update Subscriber Counts

The `updateSubscriberCounts.js` script updates the `subscriberCount` field for all users based on their actual subscribers. This is useful if you've just added the subscriber count feature or if you suspect the counts are out of sync.

### How to Run

From the server directory, run:

```bash
node scripts/updateSubscriberCounts.js
```

This will:
1. Connect to your MongoDB database
2. Find all users
3. For each user, count how many other users have them in their subscriptions
4. Update the user's `subscriberCount` field if it's different from the actual count
5. Log the changes and exit

### When to Run

Run this script:
- After adding the subscriber count feature
- If you suspect the subscriber counts are incorrect
- After migrating data from another system

Note: This script is a one-time operation and doesn't need to be run regularly, as the subscription controller now maintains the counts automatically.
