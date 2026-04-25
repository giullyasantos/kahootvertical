# Broadcast Communication Fix

## Issue
Player phones weren't receiving the "name_result" event when selected in the roulette, staying on the waiting screen instead of showing the difficulty selector.

## Root Cause
Supabase Realtime broadcast payload structure was incorrect:
- **Wrong**: Sending data directly in the payload object
- **Correct**: Nesting data inside `payload.payload`

## What Was Fixed

### 1. Host → Player (Name Selection)
**File:** `app/host/roulette/page.tsx`

**Before:**
```typescript
supabase.channel(`roulette:${room.id}`).send({
  type: 'broadcast',
  event: 'name_result',
  playerId: finalPlayer.id,
});
```

**After:**
```typescript
const channel = supabase.channel(`roulette:${room.id}`);
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.send({
      type: 'broadcast',
      event: 'name_result',
      payload: { playerId: finalPlayer.id },
    });
  }
});
```

**Player listener:**
```typescript
.on('broadcast', { event: 'name_result' }, (payload: any) => {
  if (payload.payload?.playerId === currentPlayer.id) {
    setPhase('selected');
    // ...
  }
})
```

### 2. Player → Host (Difficulty Selection)
**File:** `app/play-roulette/page.tsx`

**Before:**
```typescript
supabase.channel(`roulette:${room.id}`).send({
  type: 'broadcast',
  event: 'difficulty_result',
  difficulty: finalDiff,
});
```

**After:**
```typescript
const channel = supabase.channel(`roulette:${room.id}`);
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.send({
      type: 'broadcast',
      event: 'difficulty_result',
      payload: { difficulty: finalDiff },
    });
  }
});
```

**Host listener:**
```typescript
.on('broadcast', { event: 'difficulty_result' }, (payload: any) => {
  setDifficulty(payload.payload?.difficulty);
  // ...
})
```

### 3. Player → Host (Superpower Activation)
Same pattern applied to superpower broadcasts.

## Key Lessons

### Supabase Broadcast Structure
When using `.send()`:
```typescript
channel.send({
  type: 'broadcast',
  event: 'my_event',
  payload: { myData: 'value' }  // ← Nest your data here
});
```

When receiving with `.on()`:
```typescript
.on('broadcast', { event: 'my_event' }, (payload: any) => {
  const myData = payload.payload?.myData;  // ← Access via payload.payload
})
```

### Channel Subscription Pattern
Always subscribe before sending:
```typescript
const channel = supabase.channel('my-channel');
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.send({ /* ... */ });
  }
});
```

## Testing the Fix

1. **Host**: Click "Girar Roleta" on name roulette
2. **Expected**: Player's phone immediately shows "🎯 Você foi selecionado!"
3. **Then**: After 2 seconds, difficulty roulette appears with "Girar" button
4. **Player**: Clicks "Girar" on difficulty roulette
5. **Expected**: Host screen shows difficulty selected (🟢/🟡/🔴)
6. **Expected**: Both screens show 15-second superpower window

## Debug Tips

Added console.logs for debugging:
```typescript
console.log('Received name_result:', payload);
console.log('Player selected!', currentPlayer.id);
console.log('Host received difficulty:', payload);
```

Check browser console on both host and player devices to verify events are being sent/received.

## Related Files
- `app/host/roulette/page.tsx` - Host roulette screen
- `app/play-roulette/page.tsx` - Player roulette screen
- Both files now use correct broadcast patterns

## Status
✅ **FIXED** - Players now receive notifications and can spin difficulty roulette
