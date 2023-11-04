const {
  xml,
  Component,
  whenReady,
  useSubEnv,
  onWillStart,
  onMounted,
  useState,
  onWillUnmount,
  useExternalListener,
} = owl;

const { Spreadsheet, Model } = o_spreadsheet;
const uuidGenerator = new o_spreadsheet.helpers.UuidGenerator();

const tags = new Set();

const NOTIFICATION_STYLE =
  "position:absolute;\
  border:2px solid black;\
  background:#F5F5DCD5;\
  padding:20px;\
  z-index:10000;\
  width:140px;";

let start;

class Demo extends Component {
  setup() {
    this.state = useState({ key: 0 });
    this.stateUpdateMessages = [];
    this.client = {
      id: uuidGenerator.uuidv4(),
      name: "Local",
    };

    useSubEnv({
      notifyUser: this.notifyUser,
      raiseError: this.raiseError,
      askConfirmation: this.askConfirmation,
      editText: this.editText,
      loadCurrencies: async () => {
        return [];
      },
    });
    useExternalListener(window, "beforeunload", this.leaveCollaborativeSession.bind(this));

    onWillStart(() => this.createModel({}));

    onMounted(() => console.log("Mounted: ", Date.now() - start));
    onWillUnmount(this.leaveCollaborativeSession.bind(this));
  }

  createModel(data) {
    this.model = new Model(
      data,
      {
        evalContext: { env: this.env },
        transportService: undefined,
        client: this.client,
        mode: "normal",
      },
      this.stateUpdateMessages
    );
    o_spreadsheet.__DEBUG__ = o_spreadsheet.__DEBUG__ || {};
    o_spreadsheet.__DEBUG__.model = this.model;
    this.model.joinSession();
    this.activateFirstSheet();
  }
  askConfirmation(content, confirm, cancel) {
    if (window.confirm(content)) {
      confirm();
    } else {
      cancel();
    }
  }

  activateFirstSheet() {
    const sheetId = this.model.getters.getActiveSheetId();
    const firstSheetId = this.model.getters.getSheetIds()[0];
    if (firstSheetId !== sheetId) {
      this.model.dispatch("ACTIVATE_SHEET", { sheetIdFrom: sheetId, sheetIdTo: firstSheetId });
    }
  }

  leaveCollaborativeSession() {
    this.model.leaveSession();
  }

  notifyUser(notification) {
    if (tags.has(notification.tag)) return;
    var div = document.createElement("div");
    var text = document.createTextNode(notification.text);
    div.appendChild(text);
    div.style = NOTIFICATION_STYLE;
    const element = document.querySelector(".o-spreadsheet");
    div.onclick = () => {
      tags.delete(notification.tag);
      element.removeChild(div);
    };
    element.appendChild(div);
    tags.add(notification.tag);
  }

  raiseError(content) {
    window.alert(content);
  }

  editText(title, callback, options = {}) {
    let text;
    if (!options.error) {
      text = window.prompt(title, options.placeholder);
    } else {
      text = window.prompt(options.error, options.placeholder);
    }
    callback(text);
  }
}

Demo.template = xml/* xml */ `
  <div>
    <Spreadsheet model="model" t-key="state.key"/>
  </div>`;
Demo.components = { Spreadsheet };

// Setup code
async function setup() {
  const templates = await (await fetch("../node_modules/@odoo/o-spreadsheet/dist/o_spreadsheet.xml")).text();
  start = Date.now();

  const rootApp = new owl.App(Demo);
  rootApp.addTemplates(templates);
  rootApp.mount(document.body, { dev: true });
}
whenReady(setup);
