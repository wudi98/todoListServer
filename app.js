const Koa = require("koa");
const { ApolloServer } = require("apollo-server-koa");
const fs = require("fs");

const { gql } = require("apollo-server-koa");

// 定义从服务器获取数据的graphql方法
const typeDefs = gql`
    type todo {
        key: ID!
        title: String!
        status: Boolean!
    }
    type Query {
        todoList: [todo]!
        addTodo: [todo]!
        updateTodo(key: Int, title: String): [todo]!
        deleteTodo(key: Int): [todo]!
    }
`;

// resolvers
// Query对应查询，todoList是一个函数，返回的是数据
// 可以写异步函数，用于真实的数据库查询
// 由于没有要求说要存到数据库里，简单点做就放到文件里面了
const resolvers = {
    Query: {
        todoList: () => {
            const res = fs.readFileSync('./todoList.json','utf8');
            return JSON.parse(res).todoList;
        },
        addTodo: () => {
            const res = fs.readFileSync('./todoList.json','utf8');
            const todoList = JSON.parse(res).todoList;
            todoList.push({
                key: todoList[todoList.length - 1].key + 1,
                title: '请输入',
                status: false
            });
            fs.writeFileSync(
                './todoList.json',
                JSON.stringify({ todoList }, null ,2),
                'utf8');
            return todoList;
        },
        updateTodo: (_, { key, title }) => {
            console.log('title: ', key, title);
            const res = fs.readFileSync('./todoList.json','utf8');
            const todoList = JSON.parse(res).todoList;
            const newData = [...todoList];
            const index = newData.findIndex(item => key === item.key);
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                title,
            });
            fs.writeFileSync(
                './todoList.json',
                JSON.stringify({ todoList: newData }, null ,2),
                'utf8');
            return newData;
        },
        deleteTodo: (_, { key }) => {
            const res = fs.readFileSync('./todoList.json','utf8');
            const todoList = JSON.parse(res).todoList;
            const dataSource = todoList.filter(item => item.key !== key);
            fs.writeFileSync(
                './todoList.json',
                JSON.stringify({ todoList: dataSource }, null ,2),
                'utf8');
            return todoList;
        },
    }
};

const server = new ApolloServer({
    // 使用gql标签和字符串定义的graphql的DocumentNode
    typeDefs,
    resolvers
});
const app = new Koa();

// applyMiddleware将graphql服务连接到koa框架
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`? Server ready at http://localhost:4000${server.graphqlPath}`)
);
