const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todosTestDataToInsert = [{
	_id: new ObjectID(),
	text: 'First test todo'
}, {
	_id: new ObjectID(),
	text: 'Second test todo'
}];

beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todosTestDataToInsert);
	}).then(() => done());
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var theText = 'Test todo text';

		request(app)
			.post('/todos')
			.send({text: theText})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(theText);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}

				Todo.find({text: theText}).then((allToDos) => {
					expect(allToDos.length).toBe(1);
					expect(allToDos[0].text).toBe(theText);
					done();
				}).catch((error) => done(error));
			})
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if(err){
					return done(err);
				}

				Todo.find().then((allToDos) => {
					expect(allToDos.length).toBe(2);
					done();
				}).catch((error) => done(error))
			})
	});
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.allTodos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todosTestDataToInsert[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todosTestDataToInsert[0].text);
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done)
	});

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/todos/1234')
			.expect(404)
			.end(done)
	})
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		var hexId = todosTestDataToInsert[1]._id.toHexString();

		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}

				Todo.findById(hexId).then((todo) => {
					expect(todo).toBeFalsy();
					done();
				}).catch((e) => done(e));
			})
	});

	it('should return 404 if todo not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done)
	});

	it('should return 404 if object id is invalid', (done) => {
		request(app)
			.delete('/todos/1234')
			.expect(404)
			.end(done)
	})
});