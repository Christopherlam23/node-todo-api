const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todosTestDataToInsert = [{
	text: 'First test todo'
}, {
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
				console.log(res.body);
				expect(res.body.allTodos.length).toBe(2);
			})
			.end(done);
	});
});