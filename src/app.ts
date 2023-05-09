// Code goes here!
class globalProjectState {
  private static counter: number = 0;

  private static theGlobalProjectState: globalProjectState;
  // private static listenersStorage: any[];
  private static activeProjectsList: Array<individualProject> = [];
  // private static finishedpPojectsList: any[];

  private constructor() {}

  static getInstance() {
    if (this.theGlobalProjectState) {
      return this.theGlobalProjectState;
    } else {
      this.theGlobalProjectState = new globalProjectState();
      return this.theGlobalProjectState;
    }
  }
  static addListener() {}

  static addNewActiveProjectToList(newProj: individualProject) {
    this.activeProjectsList.push(newProj);
  }

  static getProjectIDCounter() {
    let id = (this.counter += 1);
    return id;
  }
}

interface RegisteredValidators {
  [className: string]: {
    [propName: string]: Array<string>;
  };
}

const myValidators: RegisteredValidators = {};

function noEmptyString(target: any, propName: string) {
  myValidators[target.constructor.name] = {
    ...myValidators[target.constructor.name],
    [propName]: [
      ...(myValidators[target.constructor.name]?.propName ?? []),
      "required",
    ],
  };
}

function mustPositive(target: any, propName: string) {
  myValidators[target.constructor.name] = {
    ...myValidators[target.constructor.name],
    [propName]: [
      ...(myValidators[target.constructor.name]?.propName ?? []),
      "positive",
    ],
  };
}

function validateInput(obj: any) {
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

function Autobind(
  _target: any,
  _membername: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
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
  const descriptionField = document.getElementById(
    "description"
  ) as HTMLInputElement;
  const titleField = document.getElementById("title") as HTMLInputElement;
  const peopleField = document.getElementById("people") as HTMLInputElement;
  descriptionField.value = "";
  titleField.value = "";
  peopleField.value = "";
}

class userInput {
  @noEmptyString
  titleValue: string;

  @noEmptyString
  descriptionValue: string;

  @mustPositive
  numberOfMembers: string;

  constructor(
    userEnteredTitle: string,
    userEnteredDescription: string,
    userEnteredNumber: string
  ) {
    this.titleValue = userEnteredTitle;
    this.descriptionValue = userEnteredDescription;
    this.numberOfMembers = userEnteredNumber;
  }
}

class individualProject {
  projectID: number;
  templateElement: HTMLTemplateElement;
  hostElement: HTMLUListElement;

  constructor(
    userInputTitle: string,
    userInputTeamSize: string,
    userInputDescription: string
  ) {
    this.projectID = globalProjectState.getProjectIDCounter();
    this.templateElement = document.getElementById(
      "single-project"
    )! as HTMLTemplateElement;

    this.hostElement = document
      .getElementById("active-projects")
      ?.querySelector("ul")!;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    const titleNode = document.createElement("h3");
    titleNode.innerText = userInputTitle;
    const teamSizeNode = document.createElement("p");
    teamSizeNode.innerText = userInputTeamSize + " team members";
    const descriptionNode = document.createElement("p");
    descriptionNode.innerText = userInputDescription;
    importedNode.firstElementChild?.appendChild(titleNode);
    importedNode.firstElementChild?.appendChild(teamSizeNode);
    importedNode.firstElementChild?.appendChild(descriptionNode);
    this.hostElement.appendChild(importedNode!);
  }
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  listType: string;
  // individualProjectItem: HTMLFormElement;

  constructor(userInputListType: "Finished Project" | "Active Project") {
    this.listType = userInputListType;
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    if (this.listType == "Finished Project") {
      importedNode.firstElementChild?.setAttribute("id", "finished-projects");
    } else {
      importedNode.firstElementChild?.setAttribute("id", "active-projects");
    }
    const projectListHeader = importedNode.querySelector("h2");
    projectListHeader!.insertAdjacentText("afterbegin", this.listType);
    this.hostElement.appendChild(importedNode!);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  containerElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  numberOfPeopleElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.containerElement = importedNode.firstElementChild as HTMLFormElement;
    this.containerElement.id = "user-input";
    this.titleInputElement = this.containerElement.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputElement = this.containerElement.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.numberOfPeopleElement = this.containerElement.querySelector(
      "#people"
    )! as HTMLInputElement;
    this.configure();
    this.attach();
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    let userTitleInput = this.titleInputElement.value;
    let userDescriptionInput = this.descriptionInputElement.value;
    let userMembersNumberInput = this.numberOfPeopleElement.value;
    const myUserInput = new userInput(
      userTitleInput,
      userDescriptionInput,
      userMembersNumberInput
    );
    if (!validateInput(myUserInput)) {
      alert("Invalid entry!!!");
    } else {
      const newIndividualProj = new individualProject(
        userTitleInput,
        userMembersNumberInput,
        userDescriptionInput
      );
      console.log(newIndividualProj);
      globalProjectState.addNewActiveProjectToList(newIndividualProj);
      clearInput();
    }
  }

  private configure() {
    //If don't use bind, what will happen is that the event target (the element that triggered the event, which is the form, will become 'this')
    this.containerElement.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.containerElement);
  }
}

new ProjectInput();
new ProjectList("Active Project");
new ProjectList("Finished Project");
