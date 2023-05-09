"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class globalProjectState {
    constructor() { }
    static getInstance() {
        if (this.theGlobalProjectState) {
            return this.theGlobalProjectState;
        }
        else {
            this.theGlobalProjectState = new globalProjectState();
            return this.theGlobalProjectState;
        }
    }
    static addListener() { }
    static addNewActiveProjectToList(newProj) {
        this.activeProjectsList.push(newProj);
    }
    static getProjectIDCounter() {
        let id = (this.counter += 1);
        return id;
    }
}
globalProjectState.counter = 0;
globalProjectState.activeProjectsList = [];
const myValidators = {};
function noEmptyString(target, propName) {
    var _a, _b;
    myValidators[target.constructor.name] = Object.assign(Object.assign({}, myValidators[target.constructor.name]), { [propName]: [
            ...((_b = (_a = myValidators[target.constructor.name]) === null || _a === void 0 ? void 0 : _a.propName) !== null && _b !== void 0 ? _b : []),
            "required",
        ] });
}
function mustPositive(target, propName) {
    var _a, _b;
    myValidators[target.constructor.name] = Object.assign(Object.assign({}, myValidators[target.constructor.name]), { [propName]: [
            ...((_b = (_a = myValidators[target.constructor.name]) === null || _a === void 0 ? void 0 : _a.propName) !== null && _b !== void 0 ? _b : []),
            "positive",
        ] });
}
function validateInput(obj) {
    const relatedValidators = myValidators[obj.constructor.name];
    let booleanFlag = true;
    for (const propertyName in relatedValidators) {
        for (const individualTest of relatedValidators[propertyName]) {
            switch (individualTest) {
                case "required":
                    let testResult = !!obj[propertyName];
                    booleanFlag = booleanFlag && testResult;
                    break;
                case "positive":
                    let convertToNumber = parseInt(obj[propertyName]);
                    booleanFlag = booleanFlag && convertToNumber >= 0;
                    break;
            }
        }
    }
    return booleanFlag;
}
function Autobind(_target, _membername, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
function clearInput() {
    const descriptionField = document.getElementById("description");
    const titleField = document.getElementById("title");
    const peopleField = document.getElementById("people");
    descriptionField.value = "";
    titleField.value = "";
    peopleField.value = "";
}
class userInput {
    constructor(userEnteredTitle, userEnteredDescription, userEnteredNumber) {
        this.titleValue = userEnteredTitle;
        this.descriptionValue = userEnteredDescription;
        this.numberOfMembers = userEnteredNumber;
    }
}
__decorate([
    noEmptyString
], userInput.prototype, "titleValue", void 0);
__decorate([
    noEmptyString
], userInput.prototype, "descriptionValue", void 0);
__decorate([
    mustPositive
], userInput.prototype, "numberOfMembers", void 0);
class individualProject {
    constructor(userInputTitle, userInputTeamSize, userInputDescription) {
        var _a, _b, _c, _d;
        this.projectID = globalProjectState.getProjectIDCounter();
        this.templateElement = document.getElementById("single-project");
        this.hostElement = (_a = document
            .getElementById("active-projects")) === null || _a === void 0 ? void 0 : _a.querySelector("ul");
        const importedNode = document.importNode(this.templateElement.content, true);
        const titleNode = document.createElement("h3");
        titleNode.innerText = userInputTitle;
        const teamSizeNode = document.createElement("p");
        teamSizeNode.innerText = userInputTeamSize + " team members";
        const descriptionNode = document.createElement("p");
        descriptionNode.innerText = userInputDescription;
        (_b = importedNode.firstElementChild) === null || _b === void 0 ? void 0 : _b.appendChild(titleNode);
        (_c = importedNode.firstElementChild) === null || _c === void 0 ? void 0 : _c.appendChild(teamSizeNode);
        (_d = importedNode.firstElementChild) === null || _d === void 0 ? void 0 : _d.appendChild(descriptionNode);
        this.hostElement.appendChild(importedNode);
    }
}
class ProjectList {
    constructor(userInputListType) {
        var _a, _b;
        this.listType = userInputListType;
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        if (this.listType == "Finished Project") {
            (_a = importedNode.firstElementChild) === null || _a === void 0 ? void 0 : _a.setAttribute("id", "finished-projects");
        }
        else {
            (_b = importedNode.firstElementChild) === null || _b === void 0 ? void 0 : _b.setAttribute("id", "active-projects");
        }
        const projectListHeader = importedNode.querySelector("h2");
        projectListHeader.insertAdjacentText("afterbegin", this.listType);
        this.hostElement.appendChild(importedNode);
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.containerElement = importedNode.firstElementChild;
        this.containerElement.id = "user-input";
        this.titleInputElement = this.containerElement.querySelector("#title");
        this.descriptionInputElement = this.containerElement.querySelector("#description");
        this.numberOfPeopleElement = this.containerElement.querySelector("#people");
        this.configure();
        this.attach();
    }
    submitHandler(event) {
        event.preventDefault();
        let userTitleInput = this.titleInputElement.value;
        let userDescriptionInput = this.descriptionInputElement.value;
        let userMembersNumberInput = this.numberOfPeopleElement.value;
        const myUserInput = new userInput(userTitleInput, userDescriptionInput, userMembersNumberInput);
        if (!validateInput(myUserInput)) {
            alert("Invalid entry!!!");
        }
        else {
            const newIndividualProj = new individualProject(userTitleInput, userMembersNumberInput, userDescriptionInput);
            console.log(newIndividualProj);
            globalProjectState.addNewActiveProjectToList(newIndividualProj);
            clearInput();
        }
    }
    configure() {
        this.containerElement.addEventListener("submit", this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.containerElement);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
new ProjectInput();
new ProjectList("Active Project");
new ProjectList("Finished Project");
//# sourceMappingURL=app.js.map