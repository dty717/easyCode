// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "easycode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let autoPaste = vscode.commands.registerCommand('easycode.autoPaste', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// var test = 'Hello World from easyCode!!!!!!!!!';
		// vscode.window.showInformationMessage(test);
		const editor = vscode.window.activeTextEditor;
		copyState.isAutoCopyStart = true;
		var analyseCopy = analyseCopyList();
		editor?.edit(edit => edit.replace(editor.selection.active, analyseCopy));
		copyState.copyList.push(analyseCopy);
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let autoCopy = vscode.commands.registerCommand('easycode.autoCopy', () => {
		// vscode.window.showInformationMessage('Hello test from easyCode!!!!!!!!!');
		const editor = vscode.window.activeTextEditor;
		if (copyState.isAutoCopyStart) {
			copyState.isAutoCopyStart = false;
			copyState.copyList = [];
		}
		var selectedText= editor?.document.getText(editor?.selection);
		if(selectedText){
			copyState.copyList.push(selectedText);
		}
	});
	vscode.languages.registerHoverProvider(
		'python',
		new (class implements vscode.HoverProvider {
			provideHover(
				_document: vscode.TextDocument,
				_position: vscode.Position,
				_token: vscode.CancellationToken
			): vscode.ProviderResult<vscode.Hover> {
				const commentCommandUri = vscode.Uri.parse(`command:editor.action.addCommentLine`);
				const contents = new vscode.MarkdownString(`[Add comment](${commentCommandUri})`);

				// To enable command URIs in Markdown content, you must set the `isTrusted` flag.
				// When creating trusted Markdown string, make sure to properly sanitize all the
				// input content so that only expected command URIs can be executed
				contents.isTrusted = true;

				return new vscode.Hover(contents);
			}
		})()
	);
	vscode.languages.registerHoverProvider(
		'javascript',
		new (class implements vscode.HoverProvider {
			provideHover(
				document: vscode.TextDocument,
				_position: vscode.Position,
				_token: vscode.CancellationToken
			): vscode.ProviderResult<vscode.Hover> {
				const args = [{ resourceUri: document.uri }];
				const stageCommandUri = vscode.Uri.parse(
					`command:git.stage?${encodeURIComponent(JSON.stringify(args))}`
				);
				const contents = new vscode.MarkdownString(`[Stage file](${stageCommandUri})`);
				contents.isTrusted = true;
				return new vscode.Hover(contents);
			}
		})()
	);
	context.subscriptions.push(autoPaste);
	context.subscriptions.push(autoCopy);
}

var copyState: { copyList: string[], isAutoCopyStart: boolean, copyIndex: number } = { copyList: [], isAutoCopyStart: true, copyIndex: 0 };

function analyseCopyList() {
	if (copyState && (copyState.copyList.length > 0)) {

	} else {
		return "no auto copy list";
	}
	var simpleAuto = true;
	var targetStr = copyState.copyList[0];
	var simpleAutoLen = targetStr.length;
	var len = copyState.copyList.length;
	for (var i = 1; i < len; i++) {
		if (copyState.copyList[i].length !== simpleAutoLen) {
			simpleAuto = false;
			break;
		}
	}
	if (simpleAuto) {
		var difList = [];
		var difStart = false;
		var difStartIndex = 0;
		for (var m = 0; m < simpleAutoLen; m++) {
			var difSingle = false;
			var c = targetStr[m];
			for (var n = 1; n < len; n++) {
				if (c !== copyState.copyList[n][m]) {
					difSingle = true;
					break;
				}
			}
			if (difStart) {
				if (difSingle) {
				} else {
					difStart = false;
					difList.push({ start: difStartIndex, end: m });
				}
			} else {
				if (difSingle) {
					difStart = true;
					difStartIndex = m;
				} else {

				}
			}
			if (m === simpleAutoLen - 1) {
				if (difStart) {
					difList.push({ start: difStartIndex, end: simpleAutoLen });
				}
			}
		}
		var str = "";
		var strIndex = 0;
		for (var i = 0; i < difList.length; i++) {
			str += targetStr.substring(strIndex, difList[i].start)
			strIndex = difList[i].end;
			var differences = [];
			for (var j = 0; j < len; j++) {
				differences.push(copyState.copyList[j].substring(difList[i].start, difList[i].end));
			}
			for (var k = 0; k < difList[i].end - difList[i].start; k++) {
				var difVal = [];
				for (var h = 0; h < len; h++) {
					var val = copyState.copyList[h].charCodeAt(k + difList[i].start);
					difVal.push(val);
				}
				var difStep = difVal[1] - difVal[0];
				str += String.fromCharCode(difVal[difVal.length - 1] + difStep);
			}
		}
		str += targetStr.substring(strIndex);
		return str;
	}
	return "not finishing";

}


// this method is called when your extension is deactivated
export function deactivate() { }
