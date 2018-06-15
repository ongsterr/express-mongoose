// import npm modules
import async from 'async';
import validator from 'validator';

// import user model
import User from '../models/user';

// import custom utilities
import logger from '../utils/logger';

// retrieve a list of all users
exports.list = (req, res) => {
    const query = req.query || {}

    User.apiQuery(query)
        // Limit the information returned (server-side) - e.g. no password
        .select('name email username bio url twitter background')
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        })
}

// retrieve a specific user using the user id (in our case, the user from the jwt)
exports.get = (req, res) => {
    const data = Object.assign(req.body, { user: req.user.sub }) || {}

    User.findById(data.user)
        .then(user => {
            user.password = undefined;
            user.recoveryCode = undefined;

            res.json(user)
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        })
}

// update a specific user
exports.put = (req, res) => {
    const data = Object.assign(req.body, { user: req.user.sub }) || {}; // Create a new object combining multiple objects

    if (data.email && !validator.isEmail(data.email)) {
        return res.status(422).send('Invalid email address.');
    }

    if (data.username && !validator.isAlphanumeric(data.username)) {
        return res.status(422).send('Usernames must be alphanumeric.');
    }

    User.findByIdAndUpdate({ _id: data.user }, data, { new: true }) // Issues a mongodb findAndModify update command by a document's _id field.
        .then(user => {
            if (!user) {
                return res.sendStatus(404);
            }

            user.password = undefined;
            user.recoveryCode = undefined;

            res.json(user);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
}

// create a user
exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {};

    User.create(data)
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send(err);
        });
}

// remove a user record (in our case, set the active flag to false to preserve data)
exports.delete = (req, res) => {
    User.findByIdAndUpdate(
        { _id: req.params.user },
        { active: false },
        { new: true }
    )
        .then(user => {
            if (!user) {
                return res.sendStatus(404);
            }

            res.sendStatus(204);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
}