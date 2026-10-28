// src/core/names.ts
/** Name rules follow Windows so children learn the same limits they meet on a real computer. */
var MAX_NAME_LENGTH = 60;
var FORBIDDEN_CHARS = [
	"\\",
	"/",
	":",
	"*",
	"?",
	"\"",
	"<",
	">",
	"|"
];
/** Device names Windows reserves: a file or folder cannot be called `NUL` or `prn.txt`. */
var RESERVED_NAMES = [
	"CON",
	"PRN",
	"AUX",
	"NUL",
	...[
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9
	].flatMap((n) => [`COM${n}`, `LPT${n}`])
];
/** Returns an error message in Ukrainian, or `null` when the name is valid. */
var validateName = (raw) => {
	const name = raw.trim();
	if (name.length === 0) return "Назва не може бути порожньою";
	if (name.length > 60) return `Назва задовга: не більше 60 символів`;
	if (name === "." || name === "..") return "Така назва недоступна";
	if (FORBIDDEN_CHARS.find((c) => name.includes(c)) !== void 0) return `Назва не може містити символи ${FORBIDDEN_CHARS.join(" ")}`;
	if (name.endsWith(".")) return "Назва не може закінчуватися крапкою";
	const base = name.split(".")[0]?.toUpperCase() ?? "";
	if (RESERVED_NAMES.includes(base)) return `«${base}» — зарезервоване ім'я пристрою, так назвати не можна`;
	return null;
};
/** Windows compares names without regard to letter case. */
var sameName = (a, b) => a.trim().toLocaleLowerCase("uk") === b.trim().toLocaleLowerCase("uk");
/** Splits `ліс.jpg` into `ліс` and `.jpg`. A name without a dot has an empty extension. */
var splitExtension = (name) => {
	const dot = name.lastIndexOf(".");
	return dot <= 0 ? {
		base: name,
		ext: ""
	} : {
		base: name.slice(0, dot),
		ext: name.slice(dot)
	};
};
/** Lower-case extension without the dot: `jpg`, `txt`, or an empty string. */
var extensionOf = (name) => splitExtension(name).ext.slice(1).toLocaleLowerCase("uk");
/**
* Picks the first free name: `Нова папка`, `Нова папка (2)`, `Нова папка (3)` and so on.
* The number goes before the extension: `море (2).jpg`.
*/
var freeName = (wanted, isTaken) => {
	if (!isTaken(wanted)) return wanted;
	const { base, ext } = splitExtension(wanted);
	for (let n = 2;; n++) {
		const candidate = `${base} (${n})${ext}`;
		if (!isTaken(candidate)) return candidate;
	}
};
/** Ukrainian plural: 1 файл, 2 файли, 5 файлів. */
var plural = (n, one, few, many) => {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
	return many;
};
// src/core/fs.ts
var DESKTOP_ID = "desktop";
var BIN_ID = "bin";
/** «Цей ПК»: holds the drives. Drives are folders named `C:` and `D:`. */
var THIS_PC_ID = "this-pc";
var DRIVE_LETTERS = ["C", "D"];
var driveId = (letter) => `drive-${letter}`;
var DRIVE_PATTERN = /^[a-z]:$/i;
var fail = (error) => ({
	ok: false,
	error
});
var emptyState = () => ({
	nodes: {
		[DESKTOP_ID]: {
			id: DESKTOP_ID,
			name: "Робочий стіл",
			kind: "folder",
			parentId: null
		},
		["bin"]: {
			id: "bin",
			name: "Кошик",
			kind: "folder",
			parentId: null
		},
		[THIS_PC_ID]: {
			id: THIS_PC_ID,
			name: "Цей ПК",
			kind: "folder",
			parentId: null
		},
		...Object.fromEntries(DRIVE_LETTERS.map((letter) => [driveId(letter), {
			id: driveId(letter),
			name: `${letter}:`,
			kind: "folder",
			parentId: THIS_PC_ID
		}]))
	},
	nextId: 1
});
var getNode = (state, id) => state.nodes[id];
var isDrive = (id) => DRIVE_LETTERS.some((letter) => driveId(letter) === id);
/** Desktop, bin, «Цей ПК» and drives cannot be renamed, moved or deleted. */
var isSystem = (id) => id === "desktop" || id === "bin" || id === "this-pc" || isDrive(id);
/** What the student sees: drive `D:` is shown as «Локальний диск (D:)», as in Windows. */
var isShortcut = (node) => node.target !== void 0;
var displayName = (node) => isDrive(node.id) ? `Локальний диск (${node.name})` : node.name;
var byFolderThenName = (a, b) => a.kind === b.kind ? a.name.localeCompare(b.name, "uk") : a.kind === "folder" ? -1 : 1;
var childrenOf = (state, parentId) => Object.values(state.nodes).filter((n) => n.parentId === parentId).sort(byFolderThenName);
var findChild = (state, parentId, name, exceptId) => childrenOf(state, parentId).find((n) => n.id !== exceptId && sameName(n.name, name));
/** True when `id` is `ancestorId` itself or lies somewhere inside it. */
var isInside = (state, id, ancestorId) => {
	for (let cur = getNode(state, id); cur; cur = cur.parentId === null ? void 0 : getNode(state, cur.parentId)) if (cur.id === ancestorId) return true;
	return false;
};
var isInBin = (state, id) => id !== "bin" && isInside(state, id, "bin");
/** Names from the desktop or a drive down: `["Мої фото", "ліс.jpg"]`, `["D:", "Мої уроки"]`. */
var pathOf = (state, id) => {
	const node = getNode(state, id);
	if (!node || node.parentId === null) return [];
	return [...pathOf(state, node.parentId), node.name];
};
/**
* Full path in Windows style: `D:\\Мої уроки\\монітор.jpg`. Items on the desktop start with «Робочий стіл».
*/
var windowsPath = (state, id) => {
	if (id === "this-pc") return "Цей ПК";
	if (isInBin(state, id) || id === "bin") return "Кошик";
	const parts = pathOf(state, id);
	if (parts[0] !== void 0 && DRIVE_PATTERN.test(parts[0])) return parts.length === 1 ? `${parts[0]}\\` : parts.join("\\");
	return ["Робочий стіл", ...parts].join("\\");
};
/**
* Finds a node by a path relative to the desktop (`Мої фото/ліс.jpg`) or to a drive
* (`D:/Мої уроки/монітор.jpg`). Both `/` and `\\` separate parts. Letter case is ignored.
*/
var findByPath = (state, path) => {
	const parts = path.split(/[/\\]/).map((p) => p.trim()).filter((p) => p.length > 0);
	const first = parts[0];
	const onDrive = first !== void 0 && DRIVE_PATTERN.test(first);
	let cur = onDrive ? findChild(state, THIS_PC_ID, first) : getNode(state, DESKTOP_ID);
	for (const part of onDrive ? parts.slice(1) : parts) {
		if (!cur || cur.kind !== "folder") return void 0;
		cur = findChild(state, cur.id, part);
	}
	return cur;
};
/** Folder typed into the address bar: `D:\\Мої уроки`, `Робочий стіл\\Мої фото`, `Цей ПК`. `null` if there is no such folder. */
var resolveAddress = (state, text) => {
	const trimmed = text.trim();
	if (sameName(trimmed, "Цей ПК")) return THIS_PC_ID;
	if (sameName(trimmed, "Кошик")) return "bin";
	const parts = trimmed.split(/[/\\]/).filter((p) => p.trim().length > 0);
	const node = findByPath(state, (parts[0] !== void 0 && sameName(parts[0], "Робочий стіл") ? parts.slice(1) : parts).join("/"));
	return node && node.kind === "folder" ? node.id : null;
};
var put = (state, node) => ({
	...state,
	nodes: {
		...state.nodes,
		[node.id]: node
	}
});
var withoutDeletedFrom = (node) => {
	const { deletedFrom: _ignored, ...rest } = node;
	return rest;
};
var checkTarget = (state, targetId) => {
	const target = getNode(state, targetId);
	if (!target || target.kind !== "folder") return "Це не папка";
	if (targetId === "this-pc") return "У «Цей ПК» лежать лише диски. Відкрий диск і працюй у ньому";
	if (targetId !== "bin" && isInBin(state, targetId)) return "Спершу віднови папку з кошика";
	return null;
};
var create = (state, parentId, kind, wantedName) => {
	const targetError = checkTarget(state, parentId) ?? (parentId === "bin" ? "У кошику не можна створювати" : null);
	if (targetError) return fail(targetError);
	const nameError = validateName(wantedName);
	if (nameError) return fail(nameError);
	const name = freeName(wantedName.trim(), (n) => findChild(state, parentId, n) !== void 0);
	const id = `n${state.nextId}`;
	return {
		ok: true,
		id,
		state: put({
			...state,
			nextId: state.nextId + 1
		}, {
			id,
			name,
			kind,
			parentId
		})
	};
};
/**
* «Зберегти як»: a new file `name` in `folderId`. The extension is added when the student did not type it.
* Unlike «Створити», an existing name is an error, not «(2)»: the student chooses another name.
*/
var saveFile = (state, folderId, name, ext) => {
	const trimmed = name.trim();
	const fileName = trimmed.toLocaleLowerCase("uk").endsWith(ext.toLocaleLowerCase("uk")) ? trimmed : `${trimmed}${ext}`;
	if (trimmed.length === 0) return fail("Введи ім'я файлу");
	if (folderId === "bin") return fail("У кошик не можна зберігати файли");
	if (findChild(state, folderId, fileName)) return fail(`Файл «${fileName}» уже є в цій папці. Введи інше ім'я.`);
	return create(state, folderId, "file", fileName);
};
var rename = (state, id, newName) => {
	const node = getNode(state, id);
	if (!node || isSystem(id)) return fail("Цей об'єкт не можна перейменувати");
	if (node.parentId === "bin") return fail("Спершу віднови об'єкт з кошика");
	const nameError = validateName(newName);
	if (nameError) return fail(nameError);
	const name = newName.trim();
	if (node.parentId !== null && findChild(state, node.parentId, name, id)) return fail(`Тут уже є об'єкт з назвою «${name}»`);
	return {
		ok: true,
		id,
		state: put(state, {
			...node,
			name
		})
	};
};
/** Moves to another folder. Moving into the recycle bin is the same as deleting. */
var move = (state, id, targetId) => {
	const node = getNode(state, id);
	if (!node || isSystem(id)) return fail("Цей об'єкт не можна перемістити");
	if (targetId === "bin") return remove(state, id);
	const targetError = checkTarget(state, targetId);
	if (targetError) return fail(targetError);
	if (node.parentId === targetId) return {
		ok: true,
		id,
		state
	};
	if (isInside(state, targetId, id)) return fail("Папку не можна перемістити саму в себе");
	const target = getNode(state, targetId);
	if (findChild(state, targetId, node.name)) return fail(`У папці «${target?.name}» вже є «${node.name}»`);
	const fromBin = node.parentId === "bin" ? { restored: true } : {};
	return {
		ok: true,
		id,
		state: put(state, {
			...withoutDeletedFrom(node),
			...fromBin,
			parentId: targetId
		})
	};
};
var copyTree = (state, sourceId, parentId, name) => {
	const source = getNode(state, sourceId);
	if (!source) return {
		state,
		id: sourceId
	};
	const id = `n${state.nextId}`;
	const target = source.target === void 0 ? {} : { target: source.target };
	const zip = source.zip ? { zip: true } : {};
	const withCopy = put({
		...state,
		nextId: state.nextId + 1
	}, {
		id,
		name,
		kind: source.kind,
		parentId,
		...target,
		...zip
	});
	return {
		state: childrenOf(state, sourceId).reduce((acc, child) => copyTree(acc, child.id, id, child.name).state, withCopy),
		id
	};
};
/** Copies a file or a whole folder. A copy into the same folder gets the name `море – копія.jpg`. */
var copy = (state, id, targetId) => {
	const node = getNode(state, id);
	if (!node || isSystem(id)) return fail("Цей об'єкт не можна скопіювати");
	if (targetId === "bin") return fail("У кошик не копіюють, а видаляють");
	const targetError = checkTarget(state, targetId);
	if (targetError) return fail(targetError);
	if (node.kind === "folder" && isInside(state, targetId, id)) return fail("Папку не можна скопіювати саму в себе");
	const target = getNode(state, targetId);
	let name = node.name;
	if (node.parentId === targetId) {
		const { base, ext } = splitExtension(node.name);
		name = freeName(`${base} – копія${ext}`, (n) => findChild(state, targetId, n) !== void 0);
	} else if (findChild(state, targetId, node.name)) return fail(`У папці «${target?.name}» вже є «${node.name}»`);
	return {
		ok: true,
		...copyTree(state, id, targetId, name)
	};
};
/**
* Creates a shortcut to `id` in `parentId`, named `Моя папка – ярлик`. A shortcut to a shortcut
* points at the same object, as in Windows.
*/
var createShortcut = (state, id, parentId) => {
	const node = getNode(state, id);
	if (!node || id === "desktop" || isInBin(state, id)) return fail("Для цього об'єкта не можна створити ярлик");
	const targetError = checkTarget(state, parentId) ?? (parentId === "bin" ? "У кошику не можна створювати" : null);
	if (targetError) return fail(targetError);
	const name = freeName(isShortcut(node) ? node.name : `${displayName(node)} – ярлик`, (n) => findChild(state, parentId, n) !== void 0);
	const newId = `n${state.nextId}`;
	const shortcut = {
		id: newId,
		name,
		kind: "file",
		parentId,
		target: node.target ?? id
	};
	return {
		ok: true,
		id: newId,
		state: put({
			...state,
			nextId: state.nextId + 1
		}, shortcut)
	};
};
/**
* «Надіслати → Стиснута ZIP-папка»: a `name.zip` next to the items with copies of them inside.
* The originals stay where they were.
*/
var compress = (state, ids, name) => {
	const first = ids[0] === void 0 ? void 0 : getNode(state, ids[0]);
	if (!first || first.parentId === null || ids.some(isSystem)) return fail("Ці об'єкти не можна стиснути");
	const parentId = first.parentId;
	if (parentId === "bin" || isInBin(state, parentId)) return fail("Спершу віднови об'єкти з кошика");
	const made = create(state, parentId, "folder", `${name}.zip`);
	if (!made.ok) return made;
	const zipped = put(made.state, {
		...getNode(made.state, made.id) ?? first,
		zip: true
	});
	const filled = ids.reduce((acc, id) => copyTree(acc, id, made.id, getNode(acc, id)?.name ?? "").state, zipped);
	return {
		ok: true,
		id: made.id,
		state: filled
	};
};
/** «Файл → Відкрити» in a program. */
var markOpened = (state, id) => {
	const node = getNode(state, id);
	if (!node || node.kind !== "file" || isInBin(state, id)) return fail("Цей файл не можна відкрити");
	return {
		ok: true,
		id,
		state: put(state, {
			...node,
			opened: true
		})
	};
};
/** Turns a folder into a ZIP folder; scenario trees use it for `name.zip` entries. */
var markZip = (state, id) => {
	const node = getNode(state, id);
	return node?.kind === "folder" ? put(state, {
		...node,
		zip: true
	}) : state;
};
/** «Видобути все…»: a folder named like the archive (without `.zip`) next to it, with everything from it. */
var extractAll = (state, zipId) => {
	const zip = getNode(state, zipId);
	if (!zip?.zip || zip.parentId === null) return fail("Це не ZIP-папка");
	if (isInBin(state, zipId)) return fail("Спершу віднови архів з кошика");
	const made = create(state, zip.parentId, "folder", splitExtension(zip.name).base);
	if (!made.ok) return made;
	const filled = childrenOf(state, zipId).reduce((acc, child) => copyTree(acc, child.id, made.id, child.name).state, made.state);
	return {
		ok: true,
		id: made.id,
		state: filled
	};
};
/** What a shortcut opens, or `undefined` when its object was deleted or lies in the bin. */
var shortcutTarget = (state, node) => {
	if (node.target === void 0) return void 0;
	const target = getNode(state, node.target);
	return target && !isInBin(state, target.id) ? target : void 0;
};
/** Puts an item into the recycle bin and remembers where it came from. */
var remove = (state, id) => {
	const node = getNode(state, id);
	if (!node || isSystem(id)) return fail("Цей об'єкт не можна видалити");
	if (node.parentId === "bin") return fail("Об'єкт уже в кошику");
	if (node.parentId === null) return fail("Цей об'єкт не можна видалити");
	return {
		ok: true,
		id,
		state: put(state, {
			...node,
			parentId: "bin",
			deletedFrom: node.parentId
		})
	};
};
var restore = (state, id) => {
	const node = getNode(state, id);
	if (!node || node.parentId !== "bin") return fail("Цього об'єкта немає в кошику");
	const home = node.deletedFrom !== void 0 && getNode(state, node.deletedFrom) && !isInBin(state, node.deletedFrom) ? node.deletedFrom : DESKTOP_ID;
	if (findChild(state, home, node.name)) return fail(`У папці «${getNode(state, home)?.name}» вже є «${node.name}»`);
	return {
		ok: true,
		id,
		state: put(state, {
			...withoutDeletedFrom(node),
			parentId: home,
			restored: true
		})
	};
};
var dropTree = (state, id) => {
	const afterChildren = childrenOf(state, id).reduce((acc, child) => dropTree(acc, child.id), state);
	const { [id]: _dropped, ...rest } = afterChildren.nodes;
	return {
		...afterChildren,
		nodes: rest
	};
};
/** Deletes an item from the recycle bin for good. */
var deleteForever = (state, id) => {
	const node = getNode(state, id);
	if (!node || node.parentId !== "bin") return fail("Назавжди можна видалити лише те, що лежить у кошику");
	return {
		ok: true,
		id,
		state: dropTree(state, id)
	};
};
var emptyBin = (state) => childrenOf(state, "bin").reduce((acc, n) => dropTree(acc, n.id), state);
// src/core/goals.ts
var splitPath = (path) => path.split(/[/\\]/).map((p) => p.trim()).filter((p) => p.length > 0);
/** `""` → на робочому столі, `D:` → на диску D:, `D:/Мої уроки` → у папці «D:\\Мої уроки». */
var folderLabel = (path) => {
	const parts = splitPath(path);
	if (parts.length === 0) return "на робочому столі";
	if (parts.length === 1 && /^[a-z]:$/i.test(parts[0] ?? "")) return `на диску ${parts[0]}`;
	return `у папці «${parts.join("\\")}»`;
};
var lastPart = (path) => {
	const parts = splitPath(path);
	return {
		where: parts.slice(0, -1).join("/"),
		name: parts.at(-1) ?? ""
	};
};
/** Default wording of a goal for the task list. */
var describeGoal = (goal) => {
	if (goal.text !== void 0) return goal.text;
	switch (goal.type) {
		case "exists": {
			const { where, name } = lastPart(goal.path);
			const what = goal.kind === "folder" ? "папка" : goal.kind === "file" ? "файл" : goal.kind === "zip" ? "ZIP-папка" : "";
			return `${folderLabel(where)} є ${what} «${name}»`.replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
		}
		case "absent": {
			const { where, name } = lastPart(goal.path);
			return `${folderLabel(where)} немає «${name}»`.replace(/^./, (c) => c.toUpperCase());
		}
		case "inBin": return `«${goal.name}» лежить у кошику`;
		case "shortcut": return `${folderLabel(goal.folder)} є ярлик до «${lastPart(goal.target).name}»`.replace(/^./, (c) => c.toUpperCase());
		case "opened": return `Файл «${lastPart(goal.path).name}» відкрито в програмі`;
		case "restored": return `«${lastPart(goal.path).name}» видалено в кошик і відновлено`;
		case "count": {
			const n = goal.equals;
			const files = plural(n, "файл", "файли", "файлів");
			const what = goal.ext !== void 0 ? `${files} .${goal.ext}` : goal.kind === "folder" ? plural(n, "папка", "папки", "папок") : goal.kind === "file" ? files : plural(n, "об'єкт", "об'єкти", "об'єктів");
			return `${folderLabel(goal.folder)} ${n} ${what}`.replace(/^./, (c) => c.toUpperCase());
		}
	}
};
var defaultHint = (goal) => {
	switch (goal.type) {
		case "exists": return "Перевір назву й місце: можливо, об'єкт лежить не в тій папці або назва з помилкою.";
		case "absent": return "Цей об'єкт ще на місці. Його треба перемістити або видалити.";
		case "inBin": return "Видали об'єкт: права кнопка миші (або довге натискання) → «Видалити».";
		case "shortcut": return "Клацни правою кнопкою на об'єкті → «Надіслати» → «Робочий стіл (створити ярлик)» або «Створити ярлик».";
		case "opened": return "У програмі вибери «Файл» → «Відкрити», знайди потрібні диск і папку, вибери файл і натисни «Відкрити».";
		case "restored": return "Видали об'єкт у кошик, потім відкрий «Кошик» і вибери «Відновити».";
		case "count": return "Порахуй, скільки об'єктів лежить у папці зараз, і порівняй із завданням.";
	}
};
var isMet = (state, goal) => {
	switch (goal.type) {
		case "exists": {
			const node = findByPath(state, goal.path);
			if (node === void 0 || goal.kind === void 0) return node !== void 0;
			return goal.kind === "zip" ? node.zip === true : node.kind === goal.kind;
		}
		case "absent": return findByPath(state, goal.path) === void 0;
		case "inBin": return childrenOf(state, "bin").some((n) => sameName(n.name, goal.name));
		case "shortcut": {
			const folder = findByPath(state, goal.folder);
			const target = findByPath(state, goal.target);
			if (!folder || !target) return false;
			return childrenOf(state, folder.id).some((n) => shortcutTarget(state, n)?.id === target.id);
		}
		case "opened": return findByPath(state, goal.path)?.opened === true;
		case "restored": return findByPath(state, goal.path)?.restored === true;
		case "count": {
			const folder = findByPath(state, goal.folder);
			if (!folder || folder.kind !== "folder") return false;
			return childrenOf(state, folder.id).filter((n) => (goal.kind === void 0 || n.kind === goal.kind) && (goal.ext === void 0 || n.kind === "file" && extensionOf(n.name) === goal.ext.toLocaleLowerCase("uk"))).length === goal.equals;
		}
	}
};
var checkGoals = (state, goals) => goals.map((goal) => ({
	goal,
	ok: isMet(state, goal),
	text: describeGoal(goal),
	hint: goal.hint ?? defaultHint(goal)
}));
var allMet = (results) => results.every((r) => r.ok);
// src/core/tree.ts
var inScenario = (name, error) => `Помилка в сценарії: «${name}»: ${error}`;
/** Builds folders and files; shortcuts wait until everything they may point at exists. */
var addSpec = (start, parentId, spec) => Object.entries(spec).reduce((acc, [name, child]) => {
	if (!acc.ok) return acc;
	if (typeof child === "string") return {
		...acc,
		pending: [...acc.pending, {
			parentId,
			name,
			target: child
		}]
	};
	const result = create(acc.state, parentId, child === null ? "file" : "folder", name);
	if (!result.ok) return {
		ok: false,
		error: inScenario(name, result.error)
	};
	if (child === null) return {
		...acc,
		state: result.state
	};
	const folder = name.toLocaleLowerCase("uk").endsWith(".zip") ? markZip(result.state, result.id) : result.state;
	return addSpec({
		...acc,
		state: folder
	}, result.id, child);
}, start);
var addShortcut = (built, { parentId, name, target }) => {
	if (!built.ok) return built;
	const node = findByPath(built.state, target);
	if (!node) return {
		ok: false,
		error: `Помилка в сценарії: ярлик «${name}» указує на «${target}», а такого немає`
	};
	const made = createShortcut(built.state, node.id, parentId);
	const named = made.ok ? rename(made.state, made.id, name) : made;
	return named.ok ? {
		ok: true,
		state: named.state
	} : {
		ok: false,
		error: inScenario(name, named.error)
	};
};
/** Builds the start tree, or names the first problem in it. A server uses it on data it did not write. */
var tryBuildState = (desktop, drives = {}) => {
	const built = Object.entries(drives).reduce((acc, [drive, spec]) => {
		if (!acc.ok) return acc;
		const letter = DRIVE_LETTERS.find((l) => `${l}:` === drive.toUpperCase());
		if (letter === void 0) return {
			ok: false,
			error: `Помилка в сценарії: немає диска «${drive}», є лише C: і D:`
		};
		return addSpec(acc, driveId(letter), spec);
	}, addSpec({
		ok: true,
		state: emptyState(),
		pending: []
	}, DESKTOP_ID, desktop));
	if (!built.ok) return built;
	return built.pending.reduce(addShortcut, {
		ok: true,
		state: built.state
	});
};
/** Builds the start tree of a scenario from this package; a mistake in it is a programming error. */
var buildState = (desktop, drives = {}) => {
	const built = tryBuildState(desktop, drives);
	if (!built.ok) throw new Error(built.error);
	return built.state;
};
// src/core/ops.ts
/**
* A real task takes 10–60 changes and creates fewer than 100 items. The limits keep a forged log
* from using much time or memory on the server: every change copies the node map once per new item.
*/
var MAX_OPS = 1e3;
var MAX_NODES = 1e3;
var MAX_CREATED = 5e3;
var applyOp = (state, op) => {
	switch (op.op) {
		case "create": return create(state, op.parentId, op.kind, op.name);
		case "saveFile": return saveFile(state, op.folderId, op.name, op.ext);
		case "rename": return rename(state, op.id, op.name);
		case "move": return move(state, op.id, op.targetId);
		case "copy": return copy(state, op.id, op.targetId);
		case "shortcut": return createShortcut(state, op.id, op.parentId);
		case "compress": return compress(state, op.ids, op.name);
		case "extract": return extractAll(state, op.id);
		case "openFile": return markOpened(state, op.id);
		case "remove": return remove(state, op.id);
		case "restore": return restore(state, op.id);
		case "deleteForever": return deleteForever(state, op.id);
		case "emptyBin": return {
			ok: true,
			id: "bin",
			state: emptyBin(state)
		};
	}
};
/** Applies the log in order. One impossible change makes the whole log invalid: the trainer never records one. */
var replay = (start, ops) => {
	if (ops.length > 1e3) return {
		ok: false,
		index: -1,
		error: `Забагато дій: ${ops.length}, можна не більше ${MAX_OPS}`
	};
	let state = start;
	for (const [index, op] of ops.entries()) {
		const result = applyOp(state, op);
		if (!result.ok) return {
			ok: false,
			index,
			error: result.error
		};
		if (Object.keys(result.state.nodes).length > 1e3) return {
			ok: false,
			index,
			error: `Забагато файлів і папок, можна не більше ${MAX_NODES}`
		};
		if (result.state.nextId - start.nextId > 5e3) return {
			ok: false,
			index,
			error: `Забагато нових об'єктів, можна не більше ${MAX_CREATED}`
		};
		state = result.state;
	}
	return {
		ok: true,
		state
	};
};
/**
* Builds the start tree, replays the student's log and checks every goal. Never throws:
* a broken start tree gives `index: -1` and the problem.
*/
var grade = (task, ops) => {
	const built = tryBuildState(task.start, task.drives);
	if (!built.ok) return {
		ok: false,
		index: -1,
		error: built.error
	};
	const replayed = replay(built.state, ops);
	if (!replayed.ok) return replayed;
	const results = checkGoals(replayed.state, task.goals);
	return {
		ok: true,
		solved: allMet(results),
		results,
		state: replayed.state
	};
};
export { validateName as $, isInBin as A, resolveAddress as B, driveId as C, findByPath as D, extractAll as E, markZip as F, FORBIDDEN_CHARS as G, saveFile as H, move as I, extensionOf as J, MAX_NAME_LENGTH as K, pathOf as L, isShortcut as M, isSystem as N, getNode as O, markOpened as P, splitExtension as Q, remove as R, displayName as S, emptyState as T, shortcutTarget as U, restore as V, windowsPath as W, plural as X, freeName as Y, sameName as Z, compress as _, grade as a, createShortcut as b, tryBuildState as c, describeGoal as d, BIN_ID as f, childrenOf as g, THIS_PC_ID as h, applyOp as i, isInside as j, isDrive as k, allMet as l, DRIVE_LETTERS as m, MAX_NODES as n, replay as o, DESKTOP_ID as p, RESERVED_NAMES as q, MAX_OPS as r, buildState as s, MAX_CREATED as t, checkGoals as u, copy as v, emptyBin as w, deleteForever as x, create as y, rename as z };
