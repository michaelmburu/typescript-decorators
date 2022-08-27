// Decorators - Typically start with UpperCase & receive arguments
// They run on class definition
function Logger (constructor: Function) {
    console.log('Logging...')
    console.log(constructor)
}

// Decorator Factories
function Auditor(logString: string) {
    return function(constructor: Function) {
        console.log('Audit Logging...')
        console.log(constructor)
    } 
}

function WithTemplate(template: string, hookId: string) {
    return function<T extends {new(...args: any[]): {name: string}}>(originalConstructr: T) {
        return class extends originalConstructr {
            constructor(...args: any[]) {
                super()
                console.log("Rendering template...")
                const hookElement = document.getElementById(hookId);
                if(hookElement) {
                    hookElement.innerHTML = template
                    hookElement.querySelector('h1')!.textContent = this.name
                }
            }
        }
    }
}

@Logger
//@Auditor('AUDIT-LOGGING') // N/B the brackets that allow you to pass values
@WithTemplate('<h1> My Person Object </h1>', 'app')
class Person {
    name = "MAX"

    constructor(){
        console.log("Creating person object")
    }
}

const person  = new Person()

console.log(person)

//DECORATORS - ALL EXECUTE DURING DEFINITON


// PROPERTY DECORATORS
function Log(target: any, propertyName: string) {
    console.log('Property Decorator')
    console.log(target, propertyName)
}

// ACCESSOR DECORATOR
function Log2(target: any, name: string, description: PropertyDescriptor) {
    console.log(' Acessor Decorator')
    console.log(target)
    console.log(name)
    console.log(description)
}

//METHOD DECORATOR
function Log3 (target: any, name: string | symbol, description: PropertyDescriptor) {
    console.log(' Method Decorator')
    console.log(target)
    console.log(name)
    console.log(description)
}

//PARAMETER DECORATOR
function Log4(target: any, name: string | symbol, position: number) {
    console.log(' Parameter Decorator')
    console.log(target)
    console.log(name)
    console.log(position)
}

class Product {
    @Log
    title: string
    private _price: number

    @Log2
    set price(val: number) {
        if(val > 0) {
            this._price = val
        } else {
            throw new Error("Price less than Zero")
        }
    }
    constructor(title: string, price: number) {
        this.title = title;
        this._price = price
    }

    @Log3
    getPriceWithTax(@Log4 tax: number){
        return this.price * (1 + tax)
    }
}
function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,

        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }
}

class Printer {
    message = 'This Works';

    @AutoBind
    showMessage() {
        console.log(this.message)
    }
}
const p = new Printer()
const button = document.querySelector('button')!
//button.addEventListener('click', p.showMessage) // This results in undefined
button.addEventListener('click', p.showMessage.bind) //Without AutoBind decorator, you have to do this


//VALIDATION WITH DECORATORS
interface ValidatorConfig {
    [property: string]: {
        [validatableProp: string]: string[]
    }
}

const registeredValidators: ValidatorConfig = {};


function Required(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        [propName]: ['required']
    }
}

function PositiveNumber(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name], 
        [propName]: ['required']
    }
}

function validate(obj: any) {
    const objValidators = registeredValidators[obj.constructor.name];
    if(!objValidators) {
        return true
    } 
    let isValid = true
     for (const prop in objValidators) {
        for (const validator of objValidators[prop]) {
            switch(validator) {
                case 'required':
                    return isValid = isValid && !!obj[prop] // !! = Truthy
                case 'postive':
                    return isValid && obj[prop] > 0
            }
        }
     }

     return isValid
}

class Course {
    @Required
    title: string
    @PositiveNumber
    price: number

    constructor(t: string, p: number) {
        this.title = t
        this.price = p
        
    }
}

const courseForm = document.querySelector('form')!;
courseForm.addEventListener('submit', event => {
    event.preventDefault()
    const titleEl = document.getElementById('title') as HTMLInputElement
    const priceEl = document.getElementById('price') as HTMLInputElement

    const title =  titleEl.value
    const price = +priceEl.value

    const createdCourse = new Course(title, price)
    if(!validate(createdCourse)) {
        alert(' Please try again')
    }
    console.log(createdCourse)
})