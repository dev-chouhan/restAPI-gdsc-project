This is a API based on event Management.
A person can login/signup and able to participate in following events.

Who can do what:
1. User
    Can login/signup.
    Can follow CURD over his/her persnol details.
    Can read and submit the task of event.(task request will be send to admin for authentication)
    Can send a task completed request to admin.
    Can compit on basis of Coins earned through completing tasks.

2. Admin
    Can login/signup
    Can follow CURD over his/her persnol details.
    Can verify/authenticate users request of events completion and if correct, add it to user schema/table
    Can update users events(under array) and coins.
    Can Create+Update+Delete a Event.

How things supposed to happend:
1. User
    able to login/signup
    able to perform CURD
    able to complete task and send completed task request to admin

2. Admin
    able to perform CURD
    able to add a event
    event will be added with active element: if(active === true){display it to all users} else {store event in database}
    able to modify user event completed section(where all events which are completed by user and verified by admin will be stored)
    able to get access of event done by user and user data too.

How to deploy it in your environment:
1. clone repo
2. type command in terminal: npm i
3. type: node index.js, to start backend

You can use postman for GET/POST/PUT/DELETE/etc requests.


