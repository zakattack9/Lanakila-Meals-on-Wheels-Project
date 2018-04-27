# Lanakila Bytes
Team Name: Lanakillahs <br/>
Team Members: Zak Sakata, Angela Geronimo, Ian Acosta <br/>
Project Manager: Zak Sakata <br/>
Company: Lanakila Pacific

## Project Challenge
Lanakila Meals On Wheels is currently lacking a mass communication tool to send out notifications to senior citizens; a better communication tool is needed to relay messages quicker regarding natural disaster warnings, schedule changes, recalls, etc. with user confirmation that the notification was received. 

## Project Proposal
Our application will allow administrators to send out mass messages via text message to alert customers and volunteers regarding natural disaster warnings, schedule changes, recalls, last minute changes etc. Administrators have the ability to create a voice message to be sent to participants of the Meals on Wheels program; messages will be converted from text to voice using natural language processing (Amazon Polly) later sent to all users on mass scale through text messaging applications. The application will also feature a web page that displays a record of sent messages; this enables the general public to stay notified on recent updates.

### Tech Stack:
1) Text-to-Speech (Amazon Polly)
2) Amazon Web Services
3) Mass Messenger System (Amazon SNS)
5) SQL Relational Databases
6) HTML, CSS, JavaScript
7) Login Accounts (Amazon Cognito)

### Scope (MVP):
1) Webpage for admins to access (login and password) and create messages to send out
2) Integration of Natural Language Processing with text messaging (voice to text)
3) Visual asthetics
4) Public webpage displaying previously sent messages

### Stretch Goals:
- User confirmation that notification/message was received 
- Schedule volunteers and manage shifts (Daizzy)
- Convert text to voice (sent as an automated call/voicemail)
- Different user mediums (phone calls, voicemail)

<hr/>

## Build Instructions
If you would like to set up a custom version of our application, you can follow these steps to set up the back-end:

#### Pre-Requisites:
- An Amazon Web Services (AWS) account
- Postgres database
- Serverless framework hooked up to your terminal (https://serverless.com/)

#### Set-Up:
1) Build a Postgres database on you AWS account that will hold everything (via CLI)

```
aws rds create-db-instance --db-instance-identifier exampleDBidentifier --db-name exampleDBname --allocated-storage 20 --db-instance-class db.t2.micro --engine postgres --master-username exUser --master-user-password exPass123! --port 5432 --availability-zone us-west-2a
```

_make sure to change the "identifier", "db-name", "username", and "password" values_

2) Once the database is created, connect to the database using the following command:

```
psql --host endpointExample --port 5432 --username exUser --dbname exampleDBname
```

_replace "endpointExample" with the endpoint generated after creation of your database, also make sure to replace "username" and "db-name" values with the ones you created in the previous step_ 

3) After connecting to your database, use the command, ```\connect db-name``` to access the contents inside your DB

4) Once inside your DB create a table to hold "subscriber" information:

```
CREATE TABLE subscribers(
id SERIAL PRIMARY KEY NOT NULL,
subscription_arn TEXT NOT NULL,
subscription_name TEXT NOT NULL,
subscription_endpoint TEXT NOT NULL,
subscription_contact TEXT NOT NULL
);
```

5) Create a table to hold "group" information:

```
CREATE TABLE groups(
id SERIAL PRIMARY KEY NOT NULL,
topic_arn TEXT NOT NULL,
group_name TEXT NOT NULL,
date_created TIMESTAMP
);
```

6) Create a table to hold "message" information:

```
CREATE TABLE messages(
id SERIAL PRIMARY KEY NOT NULL,
message_text TEXT NOT NULL,
last_edited TIMESTAMP,
converted_text_link TEXT
);
```

7) Create a table to hold "groups and subscribers" information:

```
CREATE TABLE groups_subscribers(
group_id SERIAL PRIMARY KEY NOT NULL,
subscriber_id TEXT NOT NULL,
subscription_arn TEXT NOT NULL
);
```

8) Next create a ```config.json``` file in the root of the "lambdas" folder

9) In the ```config.json``` file add the object below, this will be used to validate your credentials when connecting to the database

```
{
    "host" : "replace this with the endpoint to your database",
    "database" : "replace with database name",
    "table" : ["groups", "subscribers", "groups_subscribers", "messages", "quicksend"],
    "user" : "replace with username",
    "password" : "replace with password",
    "port" : 5432,
    "idleTimeoutMillis" : 1000
}
```

_make sure to add this file to your .gitignore_



<hr/>

## Project Plan
List the milestones in your project and high level tasks for each, for example:
- Create Design Wireframes and Mockups.
    - Wireframe for page 1
    - Wireframe for page 2
    - Design Mockup for page 1
    - Design Mockup for page 2
- Set up project file structure
    - Determine workflow, who will be project manager and maintainer of repo
    - Determine directory and file naming conventions and locations
- Begin client-side development
    - List of client-side tasks
- Begin server-side development
    - List of server-side tasks
- Style client-side app
    - Create css file for page 1
    - Create css file for page 2
- Create video demo
- Create presentation
- Stretch Goals 
    - Stretch Goal 1
    - Stretch Goal 2


