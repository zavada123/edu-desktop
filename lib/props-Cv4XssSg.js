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
// src/core/sizes.ts
/** FNV-1a: the same name always gives the same number, so sizes and dates never change between visits. */
var hashOf = (text) => {
	let hash = 2166136261;
	for (const char of text) {
		hash ^= char.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash;
};
var KB$1 = 1024;
var MB = KB$1 * KB$1;
/** Typical sizes of files of each kind, smallest and largest, in bytes. */
var SIZE_RANGES = {
	txt: [300, 6 * KB$1],
	rtf: [20 * KB$1, 200 * KB$1],
	doc: [25 * KB$1, 400 * KB$1],
	docx: [15 * KB$1, 300 * KB$1],
	odt: [15 * KB$1, 300 * KB$1],
	xlsx: [10 * KB$1, 200 * KB$1],
	pptx: [500 * KB$1, 8 * MB],
	pdf: [100 * KB$1, 5 * MB],
	jpg: [400 * KB$1, 4 * MB],
	jpeg: [400 * KB$1, 4 * MB],
	png: [100 * KB$1, 2 * MB],
	gif: [50 * KB$1, 2 * MB],
	bmp: [1 * MB, 6 * MB],
	mp3: [2 * MB, 9 * MB],
	wav: [5 * MB, 50 * MB],
	mp4: [20 * MB, 300 * MB],
	avi: [50 * MB, 500 * MB],
	exe: [1 * MB, 60 * MB],
	html: [2 * KB$1, 80 * KB$1],
	htm: [2 * KB$1, 80 * KB$1],
	tmp: [1 * KB$1, 64 * KB$1]
};
var OTHER_RANGE = [1 * KB$1, 500 * KB$1];
/**
* Size of a file from the start tree whose size the scenario does not give: a believable number for its type,
* the same for the same name. A scenario that needs exact sizes gives them as numbers in the tree.
*/
var defaultSize = (name) => {
	const [min, max] = SIZE_RANGES[extensionOf(name)] ?? OTHER_RANGE;
	return min + hashOf(name.toLocaleLowerCase("uk")) % (max - min);
};
// src/core/fs.ts
var DESKTOP_ID = "desktop";
var BIN_ID = "bin";
/** «Цей ПК»: holds the drives. Drives are folders named `C:` and `D:`. */
var THIS_PC_ID = "this-pc";
var DRIVE_LETTERS = ["C", "D"];
/** Where Windows keeps the desktop of the student's account; «Властивості» shows it as the location. */
var DESKTOP_PATH = "C:\\Users\\Учень\\Desktop";
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
	const desktopParts = DESKTOP_PATH.split("\\");
	const node = findByPath(state, (desktopParts.every((part, i) => parts[i] !== void 0 && sameName(parts[i], part)) ? parts.slice(desktopParts.length) : parts[0] !== void 0 && sameName(parts[0], "Робочий стіл") ? parts.slice(1) : parts).join("/"));
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
/** `size` is for files only; a new file without it is empty, like «Створити → Текстовий документ». */
var create = (state, parentId, kind, wantedName, size = 0) => {
	const targetError = checkTarget(state, parentId) ?? (parentId === "bin" ? "У кошику не можна створювати" : null);
	if (targetError) return fail(targetError);
	const nameError = validateName(wantedName);
	if (nameError) return fail(nameError);
	const name = freeName(wantedName.trim(), (n) => findChild(state, parentId, n) !== void 0);
	const id = `n${state.nextId}`;
	const node = kind === "file" ? {
		id,
		name,
		kind,
		parentId,
		size: Math.max(0, Math.round(size))
	} : {
		id,
		name,
		kind,
		parentId
	};
	return {
		ok: true,
		id,
		state: put({
			...state,
			nextId: state.nextId + 1
		}, node)
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
	return create(state, folderId, "file", fileName, defaultSize(fileName));
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
	const size = source.size === void 0 ? {} : { size: source.size };
	const attributes = {
		...source.readOnly ? { readOnly: true } : {},
		...source.hidden ? { hidden: true } : {}
	};
	const withCopy = put({
		...state,
		nextId: state.nextId + 1
	}, {
		id,
		name,
		kind: source.kind,
		parentId,
		...target,
		...zip,
		...size,
		...attributes
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
/** «Властивості → Атрибути»: «Лише читання» (files only) and «Прихований». */
var setAttributes = (state, id, { readOnly, hidden }) => {
	const node = getNode(state, id);
	if (!node || isSystem(id)) return fail("Атрибути цього об'єкта змінити не можна");
	if (isInBin(state, id)) return fail("Спершу віднови об'єкт з кошика");
	if (readOnly && node.kind === "folder") return fail("Атрибут «Лише читання» тут ставлять лише файлам");
	const { readOnly: _r, hidden: _h, ...rest } = node;
	return {
		ok: true,
		id,
		state: put(state, {
			...rest,
			...readOnly ? { readOnly: true } : {},
			...hidden ? { hidden: true } : {}
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
		case "attribute": {
			const wanted = [goal.readOnly === void 0 ? "" : `${goal.readOnly ? "" : "не "}лише для читання`, goal.hidden === void 0 ? "" : `${goal.hidden ? "" : "не "}прихований`].filter((w) => w !== "");
			return `«${lastPart(goal.path).name}»: ${wanted.join(", ")}`;
		}
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
		case "inBin": return "Видали об'єкт: права кнопка миші (або довге натискання) → **Видалити**.";
		case "shortcut": return "Клацни правою кнопкою на об'єкті → **Надіслати** → **Робочий стіл (створити ярлик)** або **Створити ярлик**.";
		case "opened": return "У програмі вибери **Файл** → **Відкрити**, знайди потрібні диск і папку, вибери файл і натисни **Відкрити**.";
		case "restored": return "Видали об'єкт у кошик, потім відкрий **Кошик** і вибери **Відновити**.";
		case "attribute": return "Клацни правою кнопкою на об'єкті → **Властивості**. Унизу в **Атрибути** постав або зніми позначку і натисни **OK**.";
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
		case "attribute": {
			const node = findByPath(state, goal.path);
			if (!node) return false;
			return (goal.readOnly === void 0 || node.readOnly === true === goal.readOnly) && (goal.hidden === void 0 || node.hidden === true === goal.hidden);
		}
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
	const isFile = child === null || typeof child === "number";
	const size = typeof child === "number" ? child : defaultSize(name);
	if (typeof child === "number" && !(Number.isFinite(child) && child >= 0)) return {
		ok: false,
		error: inScenario(name, "розмір файлу має бути числом байтів, не меншим за 0")
	};
	const result = create(acc.state, parentId, isFile ? "file" : "folder", name, size);
	if (!result.ok) return {
		ok: false,
		error: inScenario(name, result.error)
	};
	if (isFile) return {
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
/** One item in the compact form, or `undefined` for a shortcut whose object is gone or in the bin. */
var specOf = (state, node) => {
	if (node.target !== void 0) {
		const target = shortcutTarget(state, node);
		return target === void 0 ? void 0 : pathOf(state, target.id).join("/");
	}
	return node.kind === "file" ? null : folderSpec(state, node.id);
};
var folderSpec = (state, folderId) => Object.fromEntries(childrenOf(state, folderId).flatMap((child) => {
	const spec = specOf(state, child);
	return spec === void 0 ? [] : [[child.name, spec]];
}));
/**
* The desktop and the drives of `state` in the form `buildState` reads: an author arranges the start in the
* trainer, and a task keeps it as data. The recycle bin and the marks «opened» and «restored» are not kept.
*/
var toTreeSpec = (state) => ({
	desktop: folderSpec(state, DESKTOP_ID),
	drives: Object.fromEntries(DRIVE_LETTERS.map((letter) => [`${letter}:`, folderSpec(state, driveId(letter))]))
});
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
		case "attributes": return setAttributes(state, op.id, {
			readOnly: op.readOnly,
			hidden: op.hidden
		});
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
// src/core/props.ts
/** What the «Властивості» window shows, worked out the way Windows does it. */
var KB = 1024;
var CLUSTER = 4 * KB;
/** A `.lnk` file is small; its size does not depend on what it opens. */
var SHORTCUT_SIZE = 1412;
var TYPE_NAMES = {
	txt: "Текстовий документ",
	rtf: "Документ у форматі RTF",
	doc: "Документ Microsoft Word 97–2003",
	docx: "Документ Microsoft Word",
	odt: "Текст OpenDocument",
	xlsx: "Аркуш Microsoft Excel",
	pptx: "Презентація Microsoft PowerPoint",
	pdf: "Документ PDF",
	jpg: "Файл JPG",
	jpeg: "Файл JPEG",
	png: "Файл PNG",
	gif: "Файл GIF",
	bmp: "Точковий рисунок",
	mp3: "Звук у форматі MP3",
	wav: "Звук у форматі WAV",
	mp4: "Відео MP4",
	avi: "Відео AVI",
	exe: "Програма",
	html: "Документ HTML",
	htm: "Документ HTML",
	zip: "Стиснута ZIP-папка",
	tmp: "Тимчасовий файл"
};
var PROGRAMS = {
	txt: "Блокнот",
	rtf: "WordPad",
	doc: "Word",
	docx: "Word",
	odt: "LibreOffice Writer",
	xlsx: "Excel",
	pptx: "PowerPoint",
	pdf: "Microsoft Edge",
	jpg: "Фотографії",
	jpeg: "Фотографії",
	png: "Фотографії",
	gif: "Фотографії",
	bmp: "Paint",
	mp3: "Медіапрогравач",
	wav: "Медіапрогравач",
	mp4: "Кіно й ТБ",
	avi: "Кіно й ТБ",
	html: "Microsoft Edge",
	htm: "Microsoft Edge",
	zip: "Провідник"
};
/** «Тип файлу» as Windows writes it: `Текстовий документ (.txt)`, `Ярлик (.lnk)`, `Папка з файлами`. */
var typeOf = (node) => {
	if (isDrive(node.id)) return "Локальний диск";
	if (node.target !== void 0) return "Ярлик (.lnk)";
	if (node.zip) return "Стиснута ZIP-папка (.zip)";
	if (node.kind === "folder") return "Папка з файлами";
	const ext = extensionOf(node.name);
	if (ext === "") return "Файл";
	return `${TYPE_NAMES[ext] ?? `Файл ${ext.toUpperCase()}`} (.${ext})`;
};
/** «Програма»: what opens the file. `undefined` for folders and unknown types. */
var programOf = (node) => node.kind === "file" && node.target === void 0 ? PROGRAMS[extensionOf(node.name)] : void 0;
/** Size in bytes; a folder adds up everything inside it. */
var sizeOf = (state, node) => {
	if (node.target !== void 0) return SHORTCUT_SIZE;
	if (node.kind === "file") return node.size ?? 0;
	return childrenOf(state, node.id).reduce((sum, child) => sum + sizeOf(state, child), 0);
};
/** «На диску»: every file takes whole 4 KB clusters, an empty file takes none. */
var sizeOnDiskOf = (state, node) => {
	if (node.kind === "file") return Math.ceil(sizeOf(state, node) / CLUSTER) * CLUSTER;
	return childrenOf(state, node.id).reduce((sum, child) => sum + sizeOnDiskOf(state, child), 0);
};
/** «Містить»: files and folders inside, at every depth. */
var contentsOf = (state, id) => childrenOf(state, id).reduce((acc, child) => {
	if (child.kind === "file") return {
		...acc,
		files: acc.files + 1
	};
	const inner = contentsOf(state, child.id);
	return {
		files: acc.files + inner.files,
		folders: acc.folders + 1 + inner.folders
	};
}, {
	files: 0,
	folders: 0
});
/** `2 465 792`: groups of three digits, as Windows shows bytes. */
var groupDigits = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\xA0");
var UNITS = [
	"КБ",
	"МБ",
	"ГБ",
	"ТБ"
];
/**
* Short size as Explorer writes it: `345 байт`, `12,5 КБ`, `2,35 МБ`. Three significant digits, cut, not rounded;
* from 1000 of a unit Windows already takes the next one: `0,97 МБ`.
*/
var shortSize = (bytes) => {
	if (bytes < KB) return `${groupDigits(bytes)} байт`;
	let value = bytes / KB;
	let unit = 0;
	while (value >= 1e3 && unit < UNITS.length - 1) {
		value /= KB;
		unit += 1;
	}
	const digits = value < 10 ? 2 : value < 100 ? 1 : 0;
	return `${(Math.floor(value * 10 ** digits) / 10 ** digits).toFixed(digits).replace(".", ",")} ${UNITS[unit]}`;
};
/** `2,35 МБ (2 465 792 байт)`, as on the «Загальні» tab. */
var fullSize = (bytes) => `${shortSize(bytes)} (${groupDigits(bytes)} байт)`;
/**
* Windows path of the folder an item lies in («Розташування»). The desktop is a folder of the student's account:
* `C:\Users\Учень\Desktop`. A drive root ends with a backslash: `D:\`.
*/
var windowsPathOf = (state, id) => {
	if (id === "desktop") return DESKTOP_PATH;
	if (id === "this-pc") return "Цей ПК";
	const parts = pathOf(state, id);
	const first = parts[0];
	if (first !== void 0 && /^[a-z]:$/i.test(first)) return parts.length === 1 ? `${first}\\` : parts.join("\\");
	return [DESKTOP_PATH, ...parts].join("\\");
};
/** «Розташування»: the folder the item lies in. */
var locationOf = (state, node) => node.parentId === null ? "" : windowsPathOf(state, node.parentId);
/** «Об'єкт» of a shortcut: the full path of what it opens, or `undefined` when that is deleted. */
var shortcutTargetPath = (state, node) => {
	const target = shortcutTarget(state, node);
	return target === void 0 ? void 0 : windowsPathOf(state, target.id);
};
var MONTHS = [
	"січня",
	"лютого",
	"березня",
	"квітня",
	"травня",
	"червня",
	"липня",
	"серпня",
	"вересня",
	"жовтня",
	"листопада",
	"грудня"
];
/** `18 листопада 2026 р., 22:50:23`, as in Ukrainian Windows. Local time. */
var formatDate = (time) => {
	const d = new Date(time);
	const two = (n) => String(n).padStart(2, "0");
	return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} р., ${d.getHours()}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
};
var DAY = 864e5;
/** Files from the start tree were made during the school year before the lesson. */
var START_FROM = Date.UTC(2025, 8, 1, 6);
var START_DAYS = 400;
/**
* When an item from the start tree was created and last changed: the same for the same name and place,
* so every student sees the same dates. Items the student made carry their own time instead.
*/
var startDates = (state, node) => {
	const hash = hashOf(pathOf(state, node.id).join("/").toLocaleLowerCase("uk"));
	const created = START_FROM + hash % START_DAYS * DAY + hash % 36e3 * 1e3;
	return {
		created,
		modified: created + (hash >>> 8) % 40 * DAY + (hash >>> 4) % 2e4 * 1e3
	};
};
/** Disk sizes of a school computer; the system and programs already take part of drive C:. */
var DRIVES = {
	"C:": {
		capacity: 254803968e3,
		used: 103845724160
	},
	"D:": {
		capacity: 499945308160,
		used: 126915444736
	}
};
/** «Ємність», «Зайнято» and «Вільно» of a drive; what the student puts on it counts too. */
var driveSpace = (state, node) => {
	const disk = DRIVES[node.name] ?? {
		capacity: 0,
		used: 0
	};
	const used = disk.used + sizeOnDiskOf(state, node);
	return {
		capacity: disk.capacity,
		used,
		free: Math.max(0, disk.capacity - used)
	};
};
export { pathOf as $, DRIVE_LETTERS as A, emptyBin as B, tryBuildState as C, BIN_ID as D, describeGoal as E, create as F, isDrive as G, extractAll as H, createShortcut as I, isShortcut as J, isInBin as K, deleteForever as L, childrenOf as M, compress as N, DESKTOP_ID as O, copy as P, move as Q, displayName as R, toTreeSpec as S, checkGoals as T, findByPath as U, emptyState as V, getNode as W, markOpened as X, isSystem as Y, markZip as Z, MAX_OPS as _, validateName as _t, groupDigits as a, setAttributes as at, replay as b, shortSize as c, defaultSize as ct, sizeOnDiskOf as d, RESERVED_NAMES as dt, remove as et, startDates as f, extensionOf as ft, MAX_NODES as g, splitExtension as gt, MAX_CREATED as h, sameName as ht, fullSize as i, saveFile as it, THIS_PC_ID as j, DESKTOP_PATH as k, shortcutTargetPath as l, FORBIDDEN_CHARS as lt, windowsPathOf as m, plural as mt, driveSpace as n, resolveAddress as nt, locationOf as o, shortcutTarget as ot, typeOf as p, freeName as pt, isInside as q, formatDate as r, restore as rt, programOf as s, windowsPath as st, contentsOf as t, rename as tt, sizeOf as u, MAX_NAME_LENGTH as ut, applyOp as v, allMet as w, buildState as x, grade as y, driveId as z };
