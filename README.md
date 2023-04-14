# exercise-submission-stats

Simple statistics endpoint

Install nodejs and npm. Run with `npm install` and `npm start`.

Dev-Server with `npm run dev`.

## Endpoints

Add new datapoint by POSTing to `/submit` with json payload:

```
{
  path: "",
  entityId: 1234,
  revisionId: 1543,
  type: "sc",
  result: "correct",
  sessionId: "75442486-0878-440c-9db1-a7006c25a39f",
}
```

Export data by visiting `/export` and entering password.
