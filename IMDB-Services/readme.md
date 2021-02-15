# user-employee


user-employee is a Restful API for Registration, Login & a getUserList

# Features!

- Register a user with First Name, Last Name, Email ID, Password, a unique employeeID and Organization Name.
- The user must use their Email ID and Password to login.
- JWT Authentication
- Get all list of users with following criteria:
  -- Search using First Name, Last Name and employeeID
  -- Sort data by First Name, Last Name, Email ID, employeeID and Organization Name
  -- Add pagination to your API to filter the records

### Folder Structure

- __user\-employee__
    - __controllers__
        - [auth.js](controllers/auth.js)
        - [authEmployee.js](controllers/authEmployee.js)
        - [employee.js](controllers/employee.js)
        - [user.js](controllers/user.js)
    - __helpers__
        - [dbErrorHandler.js](helpers/dbErrorHandler.js)
    - [list.md](list.md)
    - __models__
        - [employee.js](models/employee.js)
        - [user.js](models/user.js)
    - __routes__
        - [auth.js](routes/auth.js)
        - [authEmployee.js](routes/authEmployee.js)
        - [employee.js](routes/employee.js)
        - [user.js](routes/user.js)
    - __validator__
        - [index.js](validator/index.js)
    - [app.js](app.js)
    - [.env](.env)
    - [package\-lock.json](package-lock.json)
    - [package.json](package.json)




### Installation

user-employee requires [Node.js](https://nodejs.org/) v6+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd  user-employee
$ npm install
$ node app
```

## Open Endpoints

Open endpoints require no Authentication.

* [SignUp] : `POST /signup/`
* [SignIn] : `POST /signin/`
* [Employee SignUp] : `POST /employee/signup/`
* [Employee SignIn] : `POST /employee/signin/`

## Endpoints that require Authentication

Closed endpoints require a valid Token to be included in the header of the
request. A Token can be acquired from the Login view above.

### User related

Each endpoint manipulates or displays information related to the User whose
Token is provided with the request:

* [User info] : `GET /user/:userId/`
* [Users List] : `GET /users?email=sandesh&sort=name&order=-1`
* [User SignOut] : `GET /signout/`

### Employee related

Endpoints for viewing and listing the Employees to the Authenticated User

* [Employee info] : `GET /employee/:empId/`
* [Employee List] : `PUT /employee?first_name=sandesh&sort=first_name&order=-1`
* [Employee SignOut] : `GET /employee/signout/`
### Development

Want to contribute? Great!

user-employee uses Express JS for fast developing.
Make a change in your file and instantaneously see your updates!

Open your favorite Terminal and run these commands.

```sh
$ node app
```

License
----

MIT


**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


[dill]: <https://github.com/joemccann/dillinger>
[git-repo-url]: <https://github.com/joemccann/dillinger.git>
[john gruber]: <http://daringfireball.net>
[df1]: <http://daringfireball.net/projects/markdown/>
[markdown-it]: <https://github.com/markdown-it/markdown-it>
[Ace Editor]: <http://ace.ajax.org>
[node.js]: <http://nodejs.org>
[Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
[jQuery]: <http://jquery.com>
[@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
[express]: <http://expressjs.com>
[AngularJS]: <http://angularjs.org>
[Gulp]: <http://gulpjs.com>

[PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
[PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
[PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
[PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
[PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
[PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
