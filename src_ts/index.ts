console.log('hello from ts');

const hname :string = "10";
let gnumber :number = 6;
let boole :boolean = true;

let arrayString :String[] = ['test', 'test'];

console.log(hname);

const fun = (params :number) :string => {
    if (params > 10) {
        return "test";
    } else {
        return "no test";
    }
}

interface User {
    _id: string
    name: string
    active: boolean
    password?: string
    email: string
}


const isAuth = (auth:boolean = false): User|null => {
    let user :User|null;

    if (auth == true) {
        user = {
            _id: "23ZERZE",
            name: "kim",
            active: true,
            email: "kim@gmail.com"
        };
    } else {
        user = null;
    }

    return user; 
}
