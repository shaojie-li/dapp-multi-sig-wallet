export async function GET(req: Request) {
    console.log('req', req);
    return new Response('callback([{name: "小燕子", age: 1}, {name: "大鹅", age: 2}])')
} 
