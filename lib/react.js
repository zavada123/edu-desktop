import { A as isInBin, B as resolveAddress, C as driveId, H as saveFile, J as extensionOf, N as isSystem, O as getNode, Q as splitExtension, S as displayName, U as shortcutTarget, W as windowsPath, X as plural, Z as sameName, g as childrenOf, h as THIS_PC_ID, i as applyOp, k as isDrive, l as allMet, m as DRIVE_LETTERS, o as replay, p as DESKTOP_ID, s as buildState, u as checkGoals } from "./ops-Brip_Ky3.js";
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
// src/ui/icons.tsx
var IMAGE = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"bmp",
	"webp"
];
var TEXT = ["txt"];
var DOC = [
	"doc",
	"docx",
	"odt",
	"rtf",
	"pdf",
	"pptx",
	"xlsx"
];
var AUDIO = [
	"mp3",
	"wav",
	"ogg"
];
var VIDEO = [
	"mp4",
	"avi",
	"mkv",
	"webm"
];
var iconKindOf = (node, binHasItems) => {
	if (node.id === "bin") return binHasItems ? "binFull" : "bin";
	if (node.id === "this-pc") return "pc";
	if (isDrive(node.id)) return "drive";
	if (node.zip) return "zip";
	if (node.kind === "folder") return "folder";
	const ext = extensionOf(node.name);
	if (IMAGE.includes(ext)) return "image";
	if (TEXT.includes(ext)) return "text";
	if (DOC.includes(ext)) return "doc";
	if (AUDIO.includes(ext)) return "audio";
	if (VIDEO.includes(ext)) return "video";
	return "file";
};
var Page = ({ color, children }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("path", {
		d: "M12 4h26l12 12v42a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
		fill: "#fff",
		stroke: "#9aa4b2",
		strokeWidth: "2"
	}),
	/* @__PURE__ */ jsx("path", {
		d: "M38 4v10a2 2 0 0 0 2 2h10",
		fill: "#e8ecf2",
		stroke: "#9aa4b2",
		strokeWidth: "2"
	}),
	/* @__PURE__ */ jsx("rect", {
		x: "16",
		y: "40",
		width: "28",
		height: "12",
		rx: "2",
		fill: color
	}),
	children
] });
var shapes = {
	zip: /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("path", {
			d: "M4 14a3 3 0 0 1 3-3h16l5 6h29a3 3 0 0 1 3 3v31a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z",
			fill: "#e8a317"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M4 22a3 3 0 0 1 3-3h50a3 3 0 0 1 3 3v29a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z",
			fill: "#ffc83d"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "28",
			y: "19",
			width: "8",
			height: "35",
			fill: "#3b4a5e"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M28 23h8M28 28h8M28 33h8M28 38h8",
			stroke: "#ffc83d",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "26",
			y: "40",
			width: "12",
			height: "10",
			rx: "2",
			fill: "#9aa4b2",
			stroke: "#3b4a5e",
			strokeWidth: "2"
		})
	] }),
	folder: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("path", {
		d: "M4 14a3 3 0 0 1 3-3h16l5 6h29a3 3 0 0 1 3 3v31a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z",
		fill: "#e8a317"
	}), /* @__PURE__ */ jsx("path", {
		d: "M4 22a3 3 0 0 1 3-3h50a3 3 0 0 1 3 3v29a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z",
		fill: "#ffc83d"
	})] }),
	bin: /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("path", {
			d: "M14 18h36l-4 38a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z",
			fill: "#dfe6ef",
			stroke: "#7b8796",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "10",
			y: "12",
			width: "44",
			height: "6",
			rx: "2",
			fill: "#b8c3d1"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M26 26v26M32 26v26M38 26v26",
			stroke: "#9aa4b2",
			strokeWidth: "2"
		})
	] }),
	binFull: /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("path", {
			d: "M14 18h36l-4 38a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z",
			fill: "#dfe6ef",
			stroke: "#7b8796",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M16 18c4-8 10-12 16-8 6-6 12-2 16 8z",
			fill: "#fff",
			stroke: "#9aa4b2",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "10",
			y: "16",
			width: "44",
			height: "5",
			rx: "2",
			fill: "#b8c3d1"
		})
	] }),
	pc: /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("rect", {
			x: "6",
			y: "10",
			width: "52",
			height: "34",
			rx: "3",
			fill: "#3b4a5e"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "10",
			y: "14",
			width: "44",
			height: "26",
			rx: "1",
			fill: "#7cc4ff"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M26 44h12l2 8H24z",
			fill: "#8a94a3"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "18",
			y: "52",
			width: "28",
			height: "4",
			rx: "2",
			fill: "#5b6577"
		})
	] }),
	drive: /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("rect", {
			x: "6",
			y: "22",
			width: "52",
			height: "22",
			rx: "4",
			fill: "#cfd6e0",
			stroke: "#7b8796",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "6",
			y: "36",
			width: "52",
			height: "8",
			rx: "2",
			fill: "#aab4c2"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "48",
			cy: "40",
			r: "2.5",
			fill: "#22c55e"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "12",
			y: "27",
			width: "20",
			height: "4",
			rx: "2",
			fill: "#7b8796"
		})
	] }),
	image: /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("rect", {
			x: "6",
			y: "10",
			width: "52",
			height: "44",
			rx: "4",
			fill: "#fff",
			stroke: "#9aa4b2",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "10",
			y: "14",
			width: "44",
			height: "36",
			rx: "2",
			fill: "#bfe3ff"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "42",
			cy: "23",
			r: "5",
			fill: "#ffd34d"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M10 50l14-18 10 12 7-8 13 14z",
			fill: "#4caf50"
		})
	] }),
	text: /* @__PURE__ */ jsx(Page, {
		color: "#5b8def",
		children: /* @__PURE__ */ jsx("path", {
			d: "M16 16h16M16 23h28M16 30h28",
			stroke: "#9aa4b2",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		})
	}),
	doc: /* @__PURE__ */ jsx(Page, {
		color: "#2f6fd6",
		children: /* @__PURE__ */ jsx("path", {
			d: "M16 18h22M16 25h28M16 32h28",
			stroke: "#2f6fd6",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		})
	}),
	audio: /* @__PURE__ */ jsxs(Page, {
		color: "#e05a8a",
		children: [
			/* @__PURE__ */ jsx("path", {
				d: "M26 34V18l14-3v15",
				fill: "none",
				stroke: "#e05a8a",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "23",
				cy: "34",
				r: "4",
				fill: "#e05a8a"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "37",
				cy: "30",
				r: "4",
				fill: "#e05a8a"
			})
		]
	}),
	video: /* @__PURE__ */ jsx(Page, {
		color: "#7a5af5",
		children: /* @__PURE__ */ jsx("path", {
			d: "M24 16l14 9-14 9z",
			fill: "#7a5af5"
		})
	}),
	file: /* @__PURE__ */ jsx(Page, { color: "#8a94a3" })
};
/** The small white square with a curved arrow in the lower left corner of a shortcut (5 клас, рис. 5.5). */
var ShortcutArrow = () => /* @__PURE__ */ jsxs("g", { children: [
	/* @__PURE__ */ jsx("rect", {
		x: "2",
		y: "38",
		width: "24",
		height: "24",
		rx: "3",
		fill: "#fff",
		stroke: "#5b6675",
		strokeWidth: "2"
	}),
	/* @__PURE__ */ jsx("path", {
		d: "M9 56c0-9 4-13 12-13",
		fill: "none",
		stroke: "#1f6feb",
		strokeWidth: "3.5",
		strokeLinecap: "round"
	}),
	/* @__PURE__ */ jsx("path", {
		d: "M15 38.5l7 4.5-6 5.5",
		fill: "none",
		stroke: "#1f6feb",
		strokeWidth: "3.5",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})
] });
var NodeIcon = ({ kind, size, shortcut = false }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 64 64",
	width: size,
	height: size,
	"aria-hidden": "true",
	children: [shapes[kind], shortcut && /* @__PURE__ */ jsx(ShortcutArrow, {})]
});
/** Icon of an item in a folder: a shortcut looks like its object plus the arrow; a broken one like a plain file. */
var ItemIcon = ({ fs, node, binHasItems, size }) => {
	if (node.target === void 0) return /* @__PURE__ */ jsx(NodeIcon, {
		kind: iconKindOf(node, binHasItems),
		size
	});
	const target = getNode(fs, node.target);
	return /* @__PURE__ */ jsx(NodeIcon, {
		kind: target ? iconKindOf(target, binHasItems) : "file",
		size,
		shortcut: true
	});
};
// src/ui/ConfirmDialog.tsx
var questionOf = (state, confirm) => {
	if (confirm.kind === "emptyBin") return {
		title: "Очистити кошик",
		text: "Видалити всі об'єкти з кошика назавжди? Відновити їх буде неможливо."
	};
	const first = getNode(state.fs, confirm.ids[0] ?? "");
	const n = confirm.ids.length;
	const what = n === 1 && first ? `«${displayName(first)}»` : `ці ${n} ${plural(n, "об'єкт", "об'єкти", "об'єктів")}`;
	return confirm.kind === "delete" ? {
		title: "Видалення",
		text: `Перемістити ${what} у кошик?`
	} : {
		title: "Видалення назавжди",
		text: `Видалити ${what} назавжди? Відновити буде неможливо.`
	};
};
/** «Ви дійсно хочете…?» window, like the one the textbook asks to confirm (4 клас, с. 48). */
var ConfirmDialog = ({ state, confirm, dispatch }) => {
	const yes = useRef(null);
	useEffect(() => yes.current?.focus(), []);
	const { title, text } = questionOf(state, confirm);
	return /* @__PURE__ */ jsx("div", {
		className: "ed-modal-backdrop",
		children: /* @__PURE__ */ jsxs("div", {
			className: "ed-dialog",
			role: "alertdialog",
			"aria-modal": "true",
			"aria-labelledby": "ed-dialog-title",
			onKeyDown: (e) => e.key === "Escape" && dispatch({ type: "cancelConfirm" }),
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "ed-titlebar",
					children: /* @__PURE__ */ jsx("span", {
						id: "ed-dialog-title",
						className: "ed-title",
						children: title
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ed-dialog-body",
					children: [/* @__PURE__ */ jsx(NodeIcon, {
						kind: "bin",
						size: 40
					}), /* @__PURE__ */ jsx("p", { children: text })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ed-dialog-actions",
					children: [/* @__PURE__ */ jsx("button", {
						ref: yes,
						type: "button",
						className: "ed-yes",
						onClick: () => dispatch({ type: "confirm" }),
						children: "Так"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => dispatch({ type: "cancelConfirm" }),
						children: "Ні"
					})]
				})
			]
		})
	});
};
// src/ui/ContextMenu.tsx
/** The clicked item and, if it is selected, every other selected item too. */
var targetsOf = (state, targetId) => state.selected.includes(targetId) ? state.selected : [targetId];
var itemMenu = (state, targetId) => {
	const node = getNode(state.fs, targetId);
	if (!node) return [];
	if (targetId === "bin") return [{
		label: "Відкрити",
		command: "open"
	}, {
		label: "Очистити кошик",
		command: { type: "askEmptyBin" },
		disabled: childrenOf(state.fs, "bin").length === 0
	}];
	if (targetId === "this-pc" || isDrive(targetId)) return [{
		label: "Відкрити",
		command: "open"
	}, {
		label: "Створити ярлик",
		command: {
			type: "shortcut",
			ids: [targetId],
			targetId: DESKTOP_ID
		}
	}];
	if (isSystem(targetId)) return [{
		label: "Відкрити",
		command: "open"
	}];
	const ids = targetsOf(state, targetId);
	if (node.parentId === "bin") return [{
		label: "Відновити",
		command: {
			type: "restore",
			ids
		}
	}, {
		label: "Видалити назавжди",
		command: {
			type: "askDelete",
			ids
		}
	}];
	if (isInBin(state.fs, targetId)) return [];
	const single = ids.length === 1;
	return [
		...single ? [{
			label: "Відкрити",
			command: "open"
		}] : [],
		...single && node.zip ? [{
			label: "Видобути все…",
			command: {
				type: "extract",
				nodeId: targetId
			}
		}] : [],
		{
			label: "Надіслати",
			command: "send"
		},
		{
			label: "Вирізати",
			command: {
				type: "clip",
				mode: "cut",
				ids
			}
		},
		{
			label: "Копіювати",
			command: {
				type: "clip",
				mode: "copy",
				ids
			}
		},
		...single && node.kind === "folder" ? [{
			label: "Вставити сюди",
			command: {
				type: "paste",
				targetId
			},
			disabled: state.clipboard === null
		}] : [],
		{
			label: "Створити ярлик",
			command: {
				type: "shortcut",
				ids,
				targetId: null
			}
		},
		{
			label: "Видалити",
			command: {
				type: "askDelete",
				ids
			}
		},
		...single ? [{
			label: "Перейменувати",
			command: {
				type: "startRename",
				nodeId: targetId
			}
		}] : []
	];
};
var spaceMenu = (state, containerId) => {
	if (containerId === "bin" || isInBin(state.fs, containerId)) return [{
		label: "Очистити кошик",
		command: { type: "askEmptyBin" },
		disabled: childrenOf(state.fs, "bin").length === 0
	}];
	if (containerId === "this-pc") return [];
	return [{
		label: "Створити",
		command: "create"
	}, {
		label: "Вставити",
		command: {
			type: "paste",
			targetId: containerId
		},
		disabled: state.clipboard === null
	}];
};
var createMenu = (containerId) => [{
	label: "Папку",
	command: {
		type: "create",
		containerId,
		kind: "folder"
	}
}, {
	label: "Текстовий документ",
	command: {
		type: "create",
		containerId,
		kind: "file"
	}
}];
/** «Надіслати ›» as in the textbook (5 клас, рис. 6.3); only the desktop item does something here. */
var sendMenu = (state, targetId) => [{
	label: "Робочий стіл (створити ярлик)",
	command: {
		type: "shortcut",
		ids: targetsOf(state, targetId),
		targetId: DESKTOP_ID
	}
}, {
	label: "Стиснута ZIP-папка",
	command: {
		type: "compress",
		ids: targetsOf(state, targetId)
	}
}];
/** After a right-button drag (5 клас, рис. 6.4). */
var dropMenu = ({ ids, targetId }) => [
	{
		label: "Копіювати сюди",
		command: {
			type: "drop",
			ids,
			targetId,
			copy: true
		}
	},
	{
		label: "Перемістити сюди",
		command: {
			type: "drop",
			ids,
			targetId,
			copy: false
		}
	},
	{
		label: "Створити ярлики",
		command: {
			type: "shortcut",
			ids,
			targetId
		}
	},
	{
		label: "Скасувати",
		command: {
			type: "menu",
			menu: null
		}
	}
];
var SUBMENU_TITLES = {
	create: "Створити",
	send: "Надіслати"
};
/** Right-click (or long-press) menu with the «Створити ›» and «Надіслати ›» submenus, as in the textbooks. Stays inside the screen. */
var ContextMenu = ({ state, menu, dispatch, onOpen }) => {
	const ref = useRef(null);
	const [pos, setPos] = useState({
		left: menu.x,
		top: menu.y
	});
	const [submenu, setSubmenu] = useState(null);
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const { width, height } = el.getBoundingClientRect();
		setPos({
			left: Math.max(4, Math.min(menu.x, window.innerWidth - width - 4)),
			top: Math.max(4, Math.min(menu.y, window.innerHeight - height - 4))
		});
	}, [
		menu.x,
		menu.y,
		submenu
	]);
	const items = menu.drop ? dropMenu(menu.drop) : submenu === "create" ? createMenu(menu.containerId) : submenu === "send" && menu.targetId !== null ? sendMenu(state, menu.targetId) : menu.targetId !== null ? itemMenu(state, menu.targetId) : spaceMenu(state, menu.containerId);
	if (items.length === 0) return null;
	const run = (command) => {
		if (command === "create" || command === "send") return setSubmenu(command);
		if (command !== "open") return dispatch(command);
		dispatch({
			type: "menu",
			menu: null
		});
		if (menu.targetId !== null) onOpen(menu.targetId);
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: "ed-menu-backdrop",
		onPointerDown: () => dispatch({
			type: "menu",
			menu: null
		}),
		onContextMenu: (e) => e.preventDefault()
	}), /* @__PURE__ */ jsxs("ul", {
		ref,
		className: "ed-menu",
		role: "menu",
		style: pos,
		children: [submenu !== null && /* @__PURE__ */ jsx("li", {
			role: "none",
			children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				role: "menuitem",
				className: "ed-menu-back",
				onClick: () => setSubmenu(null),
				children: ["‹ ", SUBMENU_TITLES[submenu]]
			})
		}), items.map((item) => /* @__PURE__ */ jsx("li", {
			role: "none",
			children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				role: "menuitem",
				disabled: item.disabled,
				onClick: () => run(item.command),
				children: [item.label, (item.command === "create" || item.command === "send") && /* @__PURE__ */ jsx("span", {
					className: "ed-menu-arrow",
					children: "›"
				})]
			})
		}, item.label))]
	})] });
};
// src/ui/ItemGrid.tsx
var RenameInput = ({ node, dispatch }) => {
	const ref = useRef(null);
	useEffect(() => {
		const input = ref.current;
		if (!input) return;
		input.focus();
		const { base } = splitExtension(node.name);
		input.setSelectionRange(0, node.kind === "folder" && !node.zip || node.target !== void 0 ? node.name.length : base.length);
	}, [
		node.id,
		node.kind,
		node.name
	]);
	return /* @__PURE__ */ jsx("input", {
		ref,
		className: "ed-rename",
		defaultValue: node.name,
		"aria-label": "Нова назва",
		onPointerDown: (e) => e.stopPropagation(),
		onKeyDown: (e) => {
			if (e.key === "Enter") dispatch({
				type: "commitRename",
				nodeId: node.id,
				name: e.currentTarget.value
			});
			if (e.key === "Escape") dispatch({ type: "cancelRename" });
		},
		onBlur: (e) => dispatch({
			type: "commitRename",
			nodeId: node.id,
			name: e.currentTarget.value
		})
	});
};
var ItemGrid = ({ state, containerId, items, bind, dispatch, variant }) => {
	const binHasItems = childrenOf(state.fs, "bin").length > 0;
	const cutIds = state.clipboard?.mode === "cut" ? state.clipboard.ids : [];
	return /* @__PURE__ */ jsxs("div", {
		className: `ed-grid ed-grid--${variant}`,
		"data-drop-id": containerId,
		...bind(null, containerId),
		children: [items.map((node) => {
			const isFolderTarget = node.kind === "folder" && node.id !== "this-pc" && (node.id === "bin" || !isInBin(state.fs, node.id));
			const classes = [
				"ed-item",
				state.selected.includes(node.id) ? "is-selected" : "",
				cutIds.includes(node.id) ? "is-cut" : ""
			];
			return /* @__PURE__ */ jsxs("div", {
				className: classes.join(" "),
				"data-drop-id": isFolderTarget ? node.id : void 0,
				title: displayName(node),
				...bind(node.id, containerId),
				children: [/* @__PURE__ */ jsx(ItemIcon, {
					fs: state.fs,
					node,
					binHasItems,
					size: variant === "desktop" ? 48 : 44
				}), state.renaming === node.id ? /* @__PURE__ */ jsx(RenameInput, {
					node,
					dispatch
				}) : /* @__PURE__ */ jsx("span", {
					className: "ed-label",
					children: displayName(node)
				})]
			}, node.id);
		}), items.length === 0 && variant === "explorer" && /* @__PURE__ */ jsx("p", {
			className: "ed-empty",
			children: "Ця папка порожня"
		})]
	});
};
// src/ui/Explorer.tsx
/** Folders from the top (desktop, «Цей ПК» or the bin) down to `id`. */
var chainOf = (state, id) => {
	const parent = getNode(state.fs, id)?.parentId;
	return parent === null || parent === void 0 ? [id] : [...chainOf(state, parent), id];
};
/** Text field shown instead of the breadcrumbs: the full path, which can also be typed and opened with Enter. */
var AddressInput = ({ state, win, dispatch, onDone }) => {
	const ref = useRef(null);
	useEffect(() => ref.current?.select(), []);
	const go = (text) => {
		const target = resolveAddress(state.fs, text);
		if (target === null) dispatch({
			type: "notify",
			message: `Не вдається знайти «${text.trim()}». Перевір, чи правильно записано шлях.`
		});
		else dispatch({
			type: "navigate",
			winId: win.id,
			nodeId: target
		});
		onDone();
	};
	return /* @__PURE__ */ jsx("input", {
		ref,
		className: "ed-path-input",
		"aria-label": "Адреса",
		defaultValue: windowsPath(state.fs, win.nodeId),
		spellCheck: false,
		onPointerDown: (e) => e.stopPropagation(),
		onKeyDown: (e) => {
			if (e.key === "Enter") go(e.currentTarget.value);
			if (e.key === "Escape") onDone();
		},
		onBlur: onDone
	});
};
/**
* Address bar as in Windows: clickable folders, and a click on its empty part turns it into
* the full path as the textbook writes it (`D:\\Мої уроки\\Інформатика`).
*/
var Address = ({ state, win, dispatch }) => {
	const [editing, setEditing] = useState(false);
	if (editing) return /* @__PURE__ */ jsx("div", {
		className: "ed-address",
		children: /* @__PURE__ */ jsx(AddressInput, {
			state,
			win,
			dispatch,
			onDone: () => setEditing(false)
		})
	});
	return /* @__PURE__ */ jsx("nav", {
		className: "ed-address",
		"aria-label": "Шлях",
		title: "Клацни тут, щоб побачити повний шлях",
		onClick: (e) => e.target === e.currentTarget && setEditing(true),
		children: chainOf(state, win.nodeId).map((id, i) => {
			const node = getNode(state.fs, id);
			return /* @__PURE__ */ jsxs("span", {
				className: "ed-crumb",
				children: [i > 0 && /* @__PURE__ */ jsx("span", {
					className: "ed-crumb-sep",
					children: "›"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => dispatch({
						type: "navigate",
						winId: win.id,
						nodeId: id
					}),
					children: node ? displayName(node) : ""
				})]
			}, id);
		})
	});
};
var Toolbar = ({ state, win, dispatch }) => {
	const folderId = win.nodeId;
	const isBin = folderId === "bin";
	const readOnly = isBin || folderId === "this-pc" || isInBin(state.fs, folderId);
	const selected = state.selected.filter((id) => getNode(state.fs, id)?.parentId === folderId);
	const none = selected.length === 0;
	const canUp = getNode(state.fs, folderId)?.parentId != null;
	const button = (label, action, disabled = false) => /* @__PURE__ */ jsx("button", {
		type: "button",
		disabled,
		onClick: () => dispatch(action),
		children: label
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "ed-toolbar",
		role: "toolbar",
		"aria-label": "Дії з файлами",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Назад",
				disabled: win.history.length === 0,
				onClick: () => dispatch({
					type: "back",
					winId: win.id
				}),
				children: "←"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Вгору",
				disabled: !canUp,
				onClick: () => dispatch({
					type: "up",
					winId: win.id
				}),
				children: "↑"
			}),
			!readOnly && /* @__PURE__ */ jsxs(Fragment, { children: [
				button("＋ Папка", {
					type: "create",
					containerId: folderId,
					kind: "folder"
				}),
				button("Перейменувати", {
					type: "startRename",
					nodeId: selected[0] ?? ""
				}, selected.length !== 1),
				button("Копіювати", {
					type: "clip",
					mode: "copy",
					ids: selected
				}, none),
				button("Вирізати", {
					type: "clip",
					mode: "cut",
					ids: selected
				}, none),
				button("Вставити", {
					type: "paste",
					targetId: folderId
				}, state.clipboard === null),
				button("Видалити", {
					type: "askDelete",
					ids: selected
				}, none)
			] }),
			isBin && /* @__PURE__ */ jsxs(Fragment, { children: [
				button("Відновити", {
					type: "restore",
					ids: selected
				}, none),
				button("Видалити назавжди", {
					type: "askDelete",
					ids: selected
				}, none),
				button("Очистити кошик", { type: "askEmptyBin" }, childrenOf(state.fs, "bin").length === 0)
			] })
		]
	});
};
var Explorer = ({ state, win, bind, dispatch }) => {
	const folderId = win.nodeId;
	const count = childrenOf(state.fs, folderId).length;
	const selectedHere = state.selected.filter((id) => getNode(state.fs, id)?.parentId === folderId).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "ed-explorer",
		children: [
			/* @__PURE__ */ jsx(Toolbar, {
				state,
				win,
				dispatch
			}),
			/* @__PURE__ */ jsx(Address, {
				state,
				win,
				dispatch
			}),
			/* @__PURE__ */ jsx(ItemGrid, {
				state,
				containerId: folderId,
				items: childrenOf(state.fs, folderId),
				bind,
				dispatch,
				variant: "explorer"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ed-status",
				children: [
					count,
					" ",
					plural(count, "об'єкт", "об'єкти", "об'єктів"),
					selectedHere > 0 && ` · виділено ${selectedHere}`
				]
			})
		]
	});
};
// src/ui/keys.ts
/**
* Windows shortcuts for the folder the student works in (`folderId`): Ctrl+C/X/V/A, Delete, F2, Enter,
* Backspace and Escape. Returns `null` for any other key, so the browser keeps it.
*/
var commandForKey = (state, press, folderId) => {
	const selected = state.selected;
	const one = selected.length === 1 ? selected[0] : void 0;
	if (press.ctrl) switch (press.code) {
		case "KeyC": return selected.length > 0 ? {
			type: "clip",
			mode: "copy",
			ids: selected
		} : null;
		case "KeyX": return selected.length > 0 ? {
			type: "clip",
			mode: "cut",
			ids: selected
		} : null;
		case "KeyV": return state.clipboard ? {
			type: "paste",
			targetId: folderId
		} : null;
		case "KeyA": return {
			type: "selectAll",
			containerId: folderId
		};
		default: return null;
	}
	switch (press.key) {
		case "Delete": return selected.length > 0 ? {
			type: "askDelete",
			ids: selected
		} : null;
		case "F2": return one !== void 0 && getNode(state.fs, one)?.parentId !== "bin" ? {
			type: "startRename",
			nodeId: one
		} : null;
		case "Enter": return one !== void 0 ? {
			type: "openItem",
			nodeId: one
		} : null;
		case "Backspace": {
			const win = state.windows.findLast((w) => w.nodeId === folderId);
			return win ? {
				type: "back",
				winId: win.id
			} : null;
		}
		case "Escape": return state.menu ? {
			type: "menu",
			menu: null
		} : selected.length > 0 ? {
			type: "select",
			nodeId: null,
			additive: false
		} : null;
		default: return null;
	}
};
// src/ui/pointer.ts
/**
* One pointer handler for mouse, pen and touch, so the trainer works the same on a phone:
* tap selects, double tap opens, long press (or right click) opens the menu,
* pressing and moving drags an item onto a folder or the bin.
* With a mouse, as in Windows: dragging with the right button asks «Копіювати сюди / Перемістити сюди»,
* and a slow second click on the name of the selected item starts renaming (5 клас, § 6).
*/
var LONG_PRESS_MS = 550;
var DOUBLE_TAP_MS = 450;
var DRAG_THRESHOLD_PX = 8;
/** Windows fires «contextmenu» after a right-button drop; it must not open the item menu then. */
var MENU_AFTER_DROP_MS = 400;
/** Finds the folder under the finger: elements carry `data-drop-id`. */
var dropTargetAt = (x, y) => {
	const el = document.elementFromPoint(x, y);
	return (el instanceof Element ? el.closest("[data-drop-id]") : null)?.dataset["dropId"] ?? null;
};
var usePointer = (handlers) => {
	const [drag, setDrag] = useState(null);
	const press = useRef(null);
	const lastTap = useRef(null);
	const renameTimer = useRef(void 0);
	const rightDropAt = useRef(0);
	const handlersRef = useRef(handlers);
	handlersRef.current = handlers;
	useEffect(() => {
		const onMove = (e) => {
			const p = press.current;
			if (!p || p.consumed || p.nodeId === null) return;
			if (!p.dragging && Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < DRAG_THRESHOLD_PX) return;
			window.clearTimeout(p.timer);
			p.dragging = true;
			setDrag({
				nodeId: p.nodeId,
				x: e.clientX,
				y: e.clientY,
				copy: e.ctrlKey && !p.right,
				right: p.right
			});
		};
		const onUp = (e) => {
			const p = press.current;
			press.current = null;
			if (!p) return;
			window.clearTimeout(p.timer);
			if (p.dragging && p.nodeId !== null) {
				setDrag(null);
				const target = dropTargetAt(e.clientX, e.clientY);
				if (target === null || target === p.containerId) return;
				if (p.right) {
					rightDropAt.current = Date.now();
					handlersRef.current.onDropMenu(e.clientX, e.clientY, p.nodeId, target);
				} else handlersRef.current.onDrop(p.nodeId, target, e.ctrlKey);
				return;
			}
			if (p.right) {
				if (p.wantMenu) handlersRef.current.onMenu(e.clientX, e.clientY, p.containerId, p.nodeId);
				return;
			}
			if (p.consumed) return;
			handlersRef.current.onSelect(p.nodeId, e.ctrlKey || e.metaKey, e.shiftKey);
			if (p.nodeId === null) return;
			const now = Date.now();
			const prev = lastTap.current;
			if (prev && prev.nodeId === p.nodeId && now - prev.time < DOUBLE_TAP_MS) {
				lastTap.current = null;
				handlersRef.current.onOpen(p.nodeId);
			} else {
				lastTap.current = {
					nodeId: p.nodeId,
					time: now
				};
				if (p.slowRename) {
					const nodeId = p.nodeId;
					renameTimer.current = window.setTimeout(() => handlersRef.current.onRename(nodeId), DOUBLE_TAP_MS);
				}
			}
		};
		const onCancel = () => {
			if (press.current) window.clearTimeout(press.current.timer);
			press.current = null;
			setDrag(null);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onCancel);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onCancel);
		};
	}, []);
	return {
		bind: useCallback((nodeId, containerId) => ({
			onPointerDown: (e) => {
				window.clearTimeout(renameTimer.current);
				const right = e.button === 2 && e.pointerType === "mouse";
				if (e.button !== 0 && !right) return;
				e.stopPropagation();
				const onLabel = e.target instanceof Element && e.target.closest(".ed-label") !== null;
				const p = {
					nodeId,
					containerId,
					startX: e.clientX,
					startY: e.clientY,
					right,
					slowRename: !right && e.pointerType === "mouse" && onLabel && nodeId !== null && handlersRef.current.isSoleSelected(nodeId),
					wantMenu: false,
					dragging: false,
					consumed: false,
					timer: void 0
				};
				if (e.pointerType !== "mouse" && !right) {
					const { clientX, clientY } = e;
					p.timer = window.setTimeout(() => {
						p.consumed = true;
						handlersRef.current.onMenu(clientX, clientY, containerId, nodeId);
					}, LONG_PRESS_MS);
				}
				press.current = p;
			},
			onContextMenu: (e) => {
				e.preventDefault();
				e.stopPropagation();
				const p = press.current;
				if (p?.right) {
					p.wantMenu = true;
					return;
				}
				if (Date.now() - rightDropAt.current < MENU_AFTER_DROP_MS) return;
				if (p?.consumed) return;
				if (p) {
					window.clearTimeout(p.timer);
					p.consumed = true;
				}
				handlersRef.current.onMenu(e.clientX, e.clientY, containerId, nodeId);
			}
		}), []),
		drag
	};
};
var initialState = (fsState, withApp = false) => {
	const empty = blankState(fsState);
	return withApp ? openWin(empty, "app") : empty;
};
var blankState = (fsState) => ({
	fs: fsState,
	windows: [],
	nextWinId: 1,
	selected: [],
	multi: false,
	renaming: null,
	clipboard: null,
	menu: null,
	confirm: null,
	message: null,
	results: null,
	fileDialog: null,
	savedAs: null,
	ops: []
});
var CASCADE_STEP = 28;
var CASCADE_SIZE = 6;
/** Windows whose folder or file no longer exists (bin emptied) are closed. */
var closeMissing = (state) => ({
	...state,
	windows: state.windows.filter((w) => w.nodeId === "app" || getNode(state.fs, w.nodeId) !== void 0),
	selected: state.selected.filter((id) => getNode(state.fs, id) !== void 0)
});
var withFs = (state, fsState) => closeMissing({
	...state,
	fs: fsState,
	menu: null,
	message: null,
	results: null
});
/** Makes one file-system change: on success keeps the new tree and records the change, on failure shows the error. */
var run = (state, op, after) => {
	const result = applyOp(state.fs, op);
	if (!result.ok) return {
		...state,
		message: result.error,
		menu: null
	};
	const next = withFs({
		...state,
		ops: [...state.ops, op]
	}, result.state);
	return after ? after(next, result.id) : next;
};
/** Makes several changes; stops at the first error and keeps nothing, like an atomic action. */
var runEach = (state, ops) => {
	let current = state.fs;
	for (const op of ops) {
		const result = applyOp(current, op);
		if (!result.ok) return {
			...state,
			message: result.error,
			menu: null
		};
		current = result.state;
	}
	return withFs({
		...state,
		ops: [...state.ops, ...ops]
	}, current);
};
var userIds = (ids) => ids.filter((id) => !isSystem(id));
var updateWin = (state, winId, change) => ({
	...state,
	windows: state.windows.map((w) => w.id === winId ? change(w) : w)
});
var focusWin = (state, winId) => {
	const win = state.windows.find((w) => w.id === winId);
	if (!win || state.windows.at(-1)?.id === winId && !win.minimized) return state;
	return {
		...state,
		windows: [...state.windows.filter((w) => w.id !== winId), {
			...win,
			minimized: false
		}]
	};
};
/** The window on top that is not minimised. */
var activeWin = (state) => state.windows.findLast((w) => !w.minimized);
var openWin = (state, nodeId) => {
	const existing = state.windows.find((w) => w.nodeId === nodeId);
	if (existing) return focusWin({
		...state,
		menu: null
	}, existing.id);
	const offset = (state.nextWinId - 1) % CASCADE_SIZE * CASCADE_STEP;
	const win = {
		id: state.nextWinId,
		nodeId,
		x: 40 + offset,
		y: 30 + offset,
		maximized: false,
		minimized: false,
		history: []
	};
	return {
		...state,
		windows: [...state.windows, win],
		nextWinId: state.nextWinId + 1,
		menu: null,
		selected: []
	};
};
var navigate = (state, winId, nodeId, remember) => updateWin({
	...state,
	selected: [],
	menu: null
}, winId, (w) => w.nodeId === nodeId ? w : {
	...w,
	nodeId,
	history: remember ? [...w.history, w.nodeId] : w.history
});
/** Ctrl+click (or a tap in «Вибрати кілька») adds or removes an item; a plain click selects only it. */
var select = (state, nodeId, additive) => {
	const base = {
		...state,
		menu: null,
		renaming: state.renaming !== null && state.renaming === nodeId ? state.renaming : null
	};
	if (nodeId === null) return additive ? base : {
		...base,
		selected: []
	};
	if (!additive) return {
		...base,
		selected: [nodeId]
	};
	const parent = getNode(state.fs, nodeId)?.parentId;
	const sameFolder = state.selected.filter((id) => getNode(state.fs, id)?.parentId === parent);
	const selected = sameFolder.includes(nodeId) ? sameFolder.filter((id) => id !== nodeId) : [...sameFolder, nodeId];
	return {
		...base,
		selected
	};
};
/** Shift+click: the items between the first selected one and `nodeId`, in the order the folder shows them. */
var selectRange = (state, nodeId) => {
	const parent = getNode(state.fs, nodeId)?.parentId;
	const anchor = state.selected[0];
	const siblings = parent == null ? [] : childrenOf(state.fs, parent).map((n) => n.id);
	const from = anchor === void 0 ? -1 : siblings.indexOf(anchor);
	const to = siblings.indexOf(nodeId);
	if (from < 0 || to < 0) return select(state, nodeId, false);
	const [a, b] = from <= to ? [from, to] : [to, from];
	const range = siblings.slice(a, b + 1);
	return {
		...state,
		menu: null,
		renaming: null,
		selected: [anchor ?? nodeId, ...range.filter((id) => id !== anchor)]
	};
};
var compress = (state, ids) => {
	const items = userIds(ids);
	const first = items[0] === void 0 ? void 0 : getNode(state.fs, items[0]);
	if (!first) return {
		...state,
		menu: null
	};
	return run(state, {
		op: "compress",
		ids: items,
		name: first.kind === "folder" ? first.name : splitExtension(first.name).base
	}, (s, id) => ({
		...s,
		selected: [id],
		renaming: id
	}));
};
var askDelete = (state, ids) => {
	const items = userIds(ids);
	if (items.length === 0) return {
		...state,
		menu: null
	};
	const inBin = items.every((id) => getNode(state.fs, id)?.parentId === "bin");
	return {
		...state,
		menu: null,
		renaming: null,
		confirm: {
			kind: inBin ? "deleteForever" : "delete",
			ids: items
		}
	};
};
var runConfirm = (state, confirm) => {
	const cleared = {
		...state,
		confirm: null,
		selected: []
	};
	switch (confirm.kind) {
		case "delete": return runEach(cleared, confirm.ids.map((id) => ({
			op: "remove",
			id
		})));
		case "deleteForever": return runEach(cleared, confirm.ids.map((id) => ({
			op: "deleteForever",
			id
		})));
		case "emptyBin": return run(cleared, { op: "emptyBin" });
	}
};
var paste = (state, targetId) => {
	const clip = state.clipboard;
	if (!clip) return {
		...state,
		menu: null
	};
	const next = runEach(state, clip.ids.map((id) => ({
		op: clip.mode === "cut" ? "move" : "copy",
		id,
		targetId
	})));
	if (next.message !== null) return next;
	return {
		...next,
		clipboard: clip.mode === "cut" ? null : clip
	};
};
var reducer = (state, action) => {
	switch (action.type) {
		case "reset": return initialState(action.fs, action.withApp);
		case "openApp": return openWin(state, "app");
		case "fileDialog": return {
			...state,
			fileDialog: action.dialog,
			menu: null
		};
		case "saveFile": return run(state, {
			op: "saveFile",
			folderId: action.folderId,
			name: action.name,
			ext: action.ext
		}, (s, id) => ({
			...s,
			fileDialog: null,
			savedAs: id
		}));
		case "openFile": return run(state, {
			op: "openFile",
			id: action.nodeId
		}, (s, id) => ({
			...s,
			fileDialog: null,
			savedAs: id
		}));
		case "newFolder": return run(state, {
			op: "create",
			parentId: action.containerId,
			kind: "folder",
			name: action.name
		});
		case "open": return getNode(state.fs, action.nodeId) ? openWin(state, action.nodeId) : state;
		case "navigate": return navigate(state, action.winId, action.nodeId, true);
		case "back": {
			const win = state.windows.find((w) => w.id === action.winId);
			const previous = win?.history.at(-1);
			if (!win || previous === void 0) return state;
			return updateWin(navigate(state, win.id, previous, false), win.id, (w) => ({
				...w,
				history: w.history.slice(0, -1)
			}));
		}
		case "up": {
			const win = state.windows.find((w) => w.id === action.winId);
			const parent = win ? getNode(state.fs, win.nodeId)?.parentId : null;
			return win && parent ? navigate(state, win.id, parent, true) : state;
		}
		case "close": return {
			...state,
			windows: state.windows.filter((w) => w.id !== action.winId),
			menu: null
		};
		case "focus": return focusWin(state, action.winId);
		case "moveWin": return updateWin(state, action.winId, (w) => ({
			...w,
			x: Math.max(0, action.x),
			y: Math.max(0, action.y)
		}));
		case "toggleMax": return updateWin(state, action.winId, (w) => ({
			...w,
			maximized: !w.maximized
		}));
		case "minimize": return updateWin({
			...state,
			menu: null
		}, action.winId, (w) => ({
			...w,
			minimized: true
		}));
		case "taskbar": return activeWin(state)?.id === action.winId ? updateWin(state, action.winId, (w) => ({
			...w,
			minimized: true
		})) : focusWin(state, action.winId);
		case "shortcut": return runEach(state, action.ids.map((id) => {
			const parent = getNode(state.fs, id)?.parentId ?? "desktop";
			return {
				op: "shortcut",
				id,
				parentId: action.targetId ?? (parent === "this-pc" ? "desktop" : parent)
			};
		}));
		case "select": return action.range && action.nodeId !== null ? selectRange(state, action.nodeId) : select(state, action.nodeId, action.additive || state.multi);
		case "compress": return compress(state, action.ids);
		case "extract": return run(state, {
			op: "extract",
			id: action.nodeId
		}, (s, id) => ({
			...s,
			selected: [id]
		}));
		case "selectAll": return {
			...state,
			menu: null,
			renaming: null,
			selected: userIds(childrenOf(state.fs, action.containerId).map((n) => n.id))
		};
		case "toggleMulti": return {
			...state,
			multi: !state.multi,
			menu: null
		};
		case "startRename": return isSystem(action.nodeId) ? state : {
			...state,
			renaming: action.nodeId,
			selected: [action.nodeId],
			menu: null
		};
		case "commitRename": {
			const node = getNode(state.fs, action.nodeId);
			if (!node || node.name === action.name.trim()) return {
				...state,
				renaming: null
			};
			const op = {
				op: "rename",
				id: action.nodeId,
				name: action.name
			};
			return applyOp(state.fs, op).ok ? run({
				...state,
				renaming: null
			}, op) : run(state, op);
		}
		case "cancelRename": return {
			...state,
			renaming: null
		};
		case "create": {
			const name = action.kind === "folder" ? "Нова папка" : "Новий текстовий документ.txt";
			return run(state, {
				op: "create",
				parentId: action.containerId,
				kind: action.kind,
				name
			}, (s, id) => ({
				...s,
				selected: [id],
				renaming: id
			}));
		}
		case "askDelete": return askDelete(state, action.ids);
		case "askEmptyBin": return childrenOf(state.fs, "bin").length === 0 ? {
			...state,
			menu: null
		} : {
			...state,
			menu: null,
			confirm: { kind: "emptyBin" }
		};
		case "confirm": return state.confirm ? runConfirm(state, state.confirm) : state;
		case "cancelConfirm": return {
			...state,
			confirm: null
		};
		case "restore": return {
			...runEach(state, action.ids.map((id) => ({
				op: "restore",
				id
			}))),
			selected: []
		};
		case "clip": {
			const ids = userIds(action.ids);
			return ids.length === 0 ? state : {
				...state,
				clipboard: {
					mode: action.mode,
					ids
				},
				menu: null
			};
		}
		case "paste": return paste(state, action.targetId);
		case "drop": {
			const ids = userIds(action.ids).filter((id) => id !== action.targetId);
			if (ids.length === 0) return state;
			const useCopy = action.copy && action.targetId !== "bin";
			return runEach(state, ids.map((id) => ({
				op: useCopy ? "copy" : "move",
				id,
				targetId: action.targetId
			})));
		}
		case "menu": return {
			...state,
			menu: action.menu,
			renaming: null
		};
		case "check": return {
			...state,
			results: checkGoals(state.fs, action.goals),
			menu: null
		};
		case "notify": return {
			...state,
			message: action.message,
			menu: null
		};
		case "dismiss": return {
			...state,
			message: null
		};
	}
};
/** Title shown in a window and on the taskbar. */
var titleOf = (state, nodeId) => {
	if (nodeId === "desktop") return "Робочий стіл";
	const node = getNode(state.fs, nodeId);
	return node ? displayName(node) : "";
};
// src/ui/AppWindow.tsx
/** What each program saves and how its window is called. */
var APPS = {
	paint: {
		title: "Paint",
		ext: ".png",
		typeLabel: "PNG (*.png)",
		fileName: "Без назви"
	},
	text: {
		title: "Текстовий редактор",
		ext: ".docx",
		typeLabel: "Документ Word (*.docx)",
		fileName: "Документ"
	},
	browser: {
		title: "Браузер",
		ext: ".jpg",
		typeLabel: "Зображення JPEG (*.jpg)",
		fileName: "зображення"
	}
};
var appTitle = (state, app) => {
	const saved = state.savedAs === null ? void 0 : state.fs.nodes[state.savedAs];
	const { title } = APPS[app.kind];
	if (app.kind === "browser") return title;
	return `${saved ? saved.name : "Без назви"} – ${title}`;
};
var COLORS = [
	"#1b2230",
	"#e11d48",
	"#f59e0b",
	"#16a34a",
	"#2563eb",
	"#facc15",
	"#ffffff"
];
var CANVAS_W = 800;
var CANVAS_H = 450;
/** A small drawing area: enough to make a picture worth saving. */
var Paint = () => {
	const canvas = useRef(null);
	const [color, setColor] = useState(COLORS[1] ?? "#000");
	const last = useRef(null);
	useEffect(() => {
		const ctx = canvas.current?.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
	}, []);
	const point = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) / rect.width * CANVAS_W,
			y: (e.clientY - rect.top) / rect.height * CANVAS_H
		};
	};
	const draw = (e) => {
		const ctx = canvas.current?.getContext("2d");
		const from = last.current;
		if (!ctx || !from) return;
		const to = point(e);
		ctx.strokeStyle = color;
		ctx.lineWidth = color === "#ffffff" ? 28 : 8;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		last.current = to;
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "ed-paint",
		children: [/* @__PURE__ */ jsx("div", {
			className: "ed-paint-colors",
			role: "toolbar",
			"aria-label": "Кольори",
			children: COLORS.map((c) => /* @__PURE__ */ jsx("button", {
				type: "button",
				className: c === color ? "is-on" : "",
				style: { background: c },
				"aria-label": c === "#ffffff" ? "Гумка" : `Колір ${c}`,
				onClick: () => setColor(c)
			}, c))
		}), /* @__PURE__ */ jsx("canvas", {
			ref: canvas,
			width: CANVAS_W,
			height: CANVAS_H,
			"aria-label": "Полотно для малювання",
			onPointerDown: (e) => {
				e.currentTarget.setPointerCapture(e.pointerId);
				last.current = point(e);
				draw(e);
			},
			onPointerMove: draw,
			onPointerUp: () => last.current = null
		})]
	});
};
var TextEditor = ({ text }) => /* @__PURE__ */ jsx("textarea", {
	className: "ed-text-editor",
	"aria-label": "Текст документа",
	placeholder: "Пиши тут…",
	defaultValue: text
}, text);
/** Text shown after «Відкрити»: the trainer keeps no file contents, so a short stand-in names the file. */
var openedText = (state) => {
	const node = state.savedAs === null ? void 0 : state.fs.nodes[state.savedAs];
	return node?.opened ? `Це текст файлу «${node.name}». Тут можна його редагувати.` : "";
};
/** A search result page with one picture; its context menu has «Зберегти зображення як…» (4 клас, с. 20). */
var Browser = ({ query, onSave }) => {
	const [menu, setMenu] = useState(null);
	return /* @__PURE__ */ jsxs("div", {
		className: "ed-browser",
		onPointerDown: () => setMenu(null),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ed-browser-bar",
				children: ["🔎 ", query]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "ed-browser-hint",
				children: "Клацни зображення правою кнопкою миші (на телефоні — натисни й потримай)."
			}),
			/* @__PURE__ */ jsxs("figure", {
				className: "ed-browser-picture",
				onContextMenu: (e) => {
					e.preventDefault();
					const box = e.currentTarget.getBoundingClientRect();
					setMenu({
						x: e.clientX - box.left,
						y: e.clientY - box.top
					});
				},
				children: [/* @__PURE__ */ jsxs("svg", {
					viewBox: "0 0 320 200",
					role: "img",
					"aria-label": query,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: "320",
							height: "200",
							fill: "#bfe3ff"
						}),
						/* @__PURE__ */ jsx("rect", {
							y: "150",
							width: "320",
							height: "50",
							fill: "#7cc36b"
						}),
						/* @__PURE__ */ jsx("rect", {
							x: "230",
							y: "70",
							width: "70",
							height: "60",
							fill: "#fff6e0",
							stroke: "#8b5e34",
							strokeWidth: "3"
						}),
						/* @__PURE__ */ jsx("path", {
							d: "M222 72l43-34 43 34z",
							fill: "#c2410c"
						}),
						[
							50,
							120,
							180
						].map((x) => /* @__PURE__ */ jsxs("g", { children: [
							/* @__PURE__ */ jsx("rect", {
								x: x - 5,
								y: "105",
								width: "10",
								height: "50",
								fill: "#8b5e34"
							}),
							/* @__PURE__ */ jsx("circle", {
								cx: x,
								cy: "95",
								r: "34",
								fill: "#f8f4f6"
							}),
							[
								-16,
								0,
								14,
								-6,
								10
							].map((dx, i) => /* @__PURE__ */ jsx("circle", {
								cx: x + dx,
								cy: 84 + i * 6,
								r: "4",
								fill: "#be123c"
							}, dx))
						] }, x))
					]
				}), menu && /* @__PURE__ */ jsxs("ul", {
					className: "ed-menu ed-browser-menu",
					role: "menu",
					style: {
						left: menu.x,
						top: menu.y
					},
					onPointerDown: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ jsx("li", {
						role: "none",
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							role: "menuitem",
							onClick: () => (setMenu(null), onSave()),
							children: "Зберегти зображення як…"
						})
					}), /* @__PURE__ */ jsx("li", {
						role: "none",
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							role: "menuitem",
							onClick: () => setMenu(null),
							children: "Копіювати зображення"
						})
					})]
				})]
			})
		]
	});
};
/** The program window's content: the «Файл» menu (Зберегти, Зберегти як) and the program itself. */
var AppContent = ({ app, state, dispatch }) => {
	const [fileMenu, setFileMenu] = useState(false);
	const saveAs = () => {
		setFileMenu(false);
		dispatch({
			type: "fileDialog",
			dialog: "save"
		});
	};
	const save = () => {
		setFileMenu(false);
		if (state.savedAs !== null && state.fs.nodes[state.savedAs]) dispatch({
			type: "notify",
			message: "Збережено."
		});
		else dispatch({
			type: "fileDialog",
			dialog: "save"
		});
	};
	const openFile = () => {
		setFileMenu(false);
		dispatch({
			type: "fileDialog",
			dialog: "open"
		});
	};
	if (app.kind === "browser") return /* @__PURE__ */ jsx(Browser, {
		query: app.fileName ?? "зображення",
		onSave: saveAs
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "ed-app",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ed-app-menubar",
			children: [/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-expanded": fileMenu,
				onClick: () => setFileMenu((v) => !v),
				children: "Файл"
			}), fileMenu && /* @__PURE__ */ jsxs("ul", {
				className: "ed-menu ed-app-filemenu",
				role: "menu",
				children: [
					/* @__PURE__ */ jsx("li", {
						role: "none",
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							role: "menuitem",
							onClick: openFile,
							children: "📂 Відкрити…"
						})
					}),
					/* @__PURE__ */ jsx("li", {
						role: "none",
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							role: "menuitem",
							onClick: save,
							children: "💾 Зберегти"
						})
					}),
					/* @__PURE__ */ jsx("li", {
						role: "none",
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							role: "menuitem",
							onClick: saveAs,
							children: "Зберегти як…"
						})
					})
				]
			})]
		}), app.kind === "paint" ? /* @__PURE__ */ jsx(Paint, {}) : /* @__PURE__ */ jsx(TextEditor, { text: openedText(state) })]
	});
};
// src/ui/SaveDialog.tsx
var PLACES = [
	DESKTOP_ID,
	THIS_PC_ID,
	...DRIVE_LETTERS.map(driveId)
];
var placeLabel = (state, id) => {
	if (id === "desktop") return "Робочий стіл";
	const node = getNode(state.fs, id);
	return node ? displayName(node) : "";
};
/**
* «Зберегти як» and «Відкрити» as the textbooks show them (3 клас, с. 54; 4 клас, с. 21): places on the left,
* the current folder, «Ім'я файлу», «Тип файлу» and the buttons. A tap on a folder opens it.
*/
var SaveDialog = ({ mode, state, app, dispatch }) => {
	const { ext, typeLabel, fileName } = APPS[app.kind];
	const opening = mode === "open";
	const [folderId, setFolderId] = useState(DESKTOP_ID);
	const [name, setName] = useState(opening ? "" : app.fileName ?? fileName);
	const [newFolder, setNewFolder] = useState(null);
	const [error, setError] = useState(null);
	const folderDone = useRef(false);
	const nameRef = useRef(null);
	useEffect(() => nameRef.current?.select(), []);
	const go = (id) => {
		setFolderId(id);
		setError(null);
	};
	const parentId = getNode(state.fs, folderId)?.parentId ?? null;
	const items = childrenOf(state.fs, folderId).filter((n) => !opening || n.kind === "folder" || `.${extensionOf(n.name)}` === ext);
	const close = () => dispatch({
		type: "fileDialog",
		dialog: null
	});
	const open = (fileName) => {
		const wanted = fileName.trim();
		const file = childrenOf(state.fs, folderId).find((n) => n.kind === "file" && (sameName(n.name, wanted) || sameName(n.name, `${wanted}${ext}`)));
		if (!file) return setError(wanted.length === 0 ? "Вибери файл" : `Файл «${wanted}» не знайдено в цій папці.`);
		dispatch({
			type: "openFile",
			nodeId: file.id
		});
	};
	const save = () => {
		if (opening) return open(name);
		const result = saveFile(state.fs, folderId, name, ext);
		if (!result.ok) return setError(result.error);
		dispatch({
			type: "saveFile",
			folderId,
			name,
			ext
		});
	};
	const startFolder = () => {
		folderDone.current = false;
		setNewFolder("Нова папка");
	};
	const makeFolder = (folderName) => {
		if (folderDone.current) return;
		folderDone.current = true;
		setNewFolder(null);
		if (folderName.trim().length > 0) dispatch({
			type: "newFolder",
			containerId: folderId,
			name: folderName
		});
	};
	return /* @__PURE__ */ jsx("div", {
		className: "ed-modal-backdrop",
		children: /* @__PURE__ */ jsxs("div", {
			className: "ed-dialog ed-save",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "ed-save-title",
			onKeyDown: (e) => e.key === "Escape" && close(),
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "ed-titlebar",
					children: [/* @__PURE__ */ jsx("span", {
						id: "ed-save-title",
						className: "ed-title",
						children: opening ? "Відкрити" : app.kind === "browser" ? "Зберегти зображення як" : "Зберегти як"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ed-tb-btn ed-close",
						"aria-label": "Закрити",
						onClick: () => close(),
						children: "✕"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ed-save-nav",
					children: [
						/* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: parentId === null,
							onClick: () => parentId !== null && go(parentId),
							"aria-label": "Вгору",
							children: "↑"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "ed-save-path",
							children: windowsPath(state.fs, folderId)
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: folderId === THIS_PC_ID,
							hidden: opening,
							onClick: startFolder,
							children: "＋ Нова папка"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ed-save-body",
					children: [/* @__PURE__ */ jsx("ul", {
						className: "ed-save-places",
						"aria-label": "Розташування",
						children: PLACES.filter((id) => getNode(state.fs, id) || id === "desktop").map((id) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: id === folderId ? "is-on" : "",
							onClick: () => go(id),
							children: [/* @__PURE__ */ jsx(NodeIcon, {
								kind: id === "desktop" ? "folder" : id === "this-pc" ? "pc" : "drive",
								size: 20
							}), placeLabel(state, id)]
						}) }, id))
					}), /* @__PURE__ */ jsxs("ul", {
						className: "ed-save-list",
						"aria-label": "Вміст папки",
						children: [
							newFolder !== null && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("input", {
								className: "ed-rename",
								"aria-label": "Назва нової папки",
								autoFocus: true,
								defaultValue: newFolder,
								onFocus: (e) => e.currentTarget.select(),
								onKeyDown: (e) => {
									if (e.key === "Enter") makeFolder(e.currentTarget.value);
									if (e.key === "Escape") {
										e.stopPropagation();
										folderDone.current = true;
										setNewFolder(null);
									}
								},
								onBlur: (e) => makeFolder(e.currentTarget.value)
							}) }),
							items.map((node) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: node.kind === "folder" ? "" : "is-file",
								onClick: () => node.kind === "folder" && node.id !== "bin" ? go(node.id) : node.kind === "file" && (setName(node.name), setError(null)),
								onDoubleClick: () => opening && node.kind === "file" && open(node.name),
								children: [/* @__PURE__ */ jsx(ItemIcon, {
									fs: state.fs,
									node,
									binHasItems: false,
									size: 24
								}), displayName(node)]
							}) }, node.id)),
							items.length === 0 && newFolder === null && /* @__PURE__ */ jsx("li", {
								className: "ed-empty",
								children: "Ця папка порожня"
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ed-save-fields",
					children: [
						/* @__PURE__ */ jsxs("label", { children: ["Ім'я файлу:", /* @__PURE__ */ jsx("input", {
							ref: nameRef,
							value: name,
							spellCheck: false,
							onChange: (e) => (setName(e.target.value), setError(null)),
							onKeyDown: (e) => e.key === "Enter" && save()
						})] }),
						/* @__PURE__ */ jsxs("label", { children: ["Тип файлу:", /* @__PURE__ */ jsx("input", {
							value: typeLabel,
							readOnly: true,
							tabIndex: -1
						})] }),
						error && /* @__PURE__ */ jsx("p", {
							className: "ed-save-error",
							role: "alert",
							children: error
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ed-dialog-actions",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ed-yes",
						onClick: save,
						children: opening ? "Відкрити" : "Зберегти"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => close(),
						children: "Скасувати"
					})]
				})
			]
		})
	});
};
// src/ui/TaskPanel.tsx
/** The task card: what to do, the "Перевірити" button and the result of each condition. */
var TaskPanel = ({ scenario, state, open, onToggle, onReset, dispatch, selfCheck }) => {
	const results = state.results;
	const solved = results !== null && allMet(results);
	return /* @__PURE__ */ jsxs("div", {
		className: `ed-task ${open ? "is-open" : ""}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ed-task-head",
				children: [
					scenario.grade > 0 && /* @__PURE__ */ jsxs("span", {
						className: "ed-grade",
						children: [scenario.grade, " клас"]
					}),
					/* @__PURE__ */ jsx("h2", { children: scenario.title }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ed-task-hide",
						"aria-label": "Сховати завдання",
						onClick: onToggle,
						children: "✕"
					})
				]
			}),
			/* @__PURE__ */ jsx("ol", {
				className: "ed-task-steps",
				children: scenario.task.map((step) => /* @__PURE__ */ jsx("li", { children: step }, step))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ed-task-actions",
				children: [selfCheck && /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "ed-check",
					onClick: () => dispatch({
						type: "check",
						goals: scenario.goals
					}),
					children: "Перевірити"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "ed-reset",
					onClick: onReset,
					children: "Почати спочатку"
				})]
			}),
			results !== null && /* @__PURE__ */ jsxs("div", {
				className: `ed-results ${solved ? "is-solved" : ""}`,
				role: "status",
				children: [/* @__PURE__ */ jsx("p", {
					className: "ed-results-head",
					children: solved ? "🎉 Молодець! Усе виконано." : `Виконано ${results.filter((r) => r.ok).length} з ${results.length}`
				}), /* @__PURE__ */ jsx("ul", { children: results.map((r) => /* @__PURE__ */ jsxs("li", {
					className: r.ok ? "is-ok" : "is-bad",
					children: [
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: r.ok ? "✅" : "❌"
						}),
						" ",
						r.text,
						!r.ok && /* @__PURE__ */ jsx("small", { children: r.hint })
					]
				}, r.text)) })]
			})
		]
	});
};
// src/ui/Window.tsx
/** Window frame: title bar to drag, minimise, maximise and close buttons. On phones it always fills the screen (CSS). */
var Window = ({ win, title, icon, active, zIndex, dispatch, children }) => {
	const dragStart = useRef(null);
	const onTitlePointerDown = (e) => {
		if (win.maximized || e.button !== 0 || e.target instanceof HTMLButtonElement) return;
		dragStart.current = {
			dx: e.clientX - win.x,
			dy: e.clientY - win.y
		};
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const onTitlePointerMove = (e) => {
		const start = dragStart.current;
		if (start) dispatch({
			type: "moveWin",
			winId: win.id,
			x: e.clientX - start.dx,
			y: e.clientY - start.dy
		});
	};
	return /* @__PURE__ */ jsxs("section", {
		"data-win-id": win.id,
		className: `ed-win ${win.maximized ? "is-max" : ""} ${active ? "is-active" : ""}`,
		style: {
			left: win.x,
			top: win.y,
			zIndex
		},
		"aria-label": title,
		onPointerDownCapture: () => dispatch({
			type: "focus",
			winId: win.id
		}),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ed-titlebar",
			onPointerDown: onTitlePointerDown,
			onPointerMove: onTitlePointerMove,
			onPointerUp: () => dragStart.current = null,
			onDoubleClick: () => dispatch({
				type: "toggleMax",
				winId: win.id
			}),
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "ed-title-icon",
					children: icon
				}),
				/* @__PURE__ */ jsx("span", {
					className: "ed-title",
					children: title
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "ed-tb-btn ed-min",
					"aria-label": "Згорнути",
					onClick: () => dispatch({
						type: "minimize",
						winId: win.id
					}),
					children: "─"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "ed-tb-btn ed-max",
					"aria-label": "Розгорнути",
					onClick: () => dispatch({
						type: "toggleMax",
						winId: win.id
					}),
					children: "▢"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "ed-tb-btn ed-close",
					"aria-label": "Закрити",
					onClick: () => dispatch({
						type: "close",
						winId: win.id
					}),
					children: "✕"
				})
			]
		}), children]
	});
};
// src/ui/EduDesktop.tsx
var MESSAGE_MS = 4e3;
var APP_ICONS = {
	paint: "🎨",
	text: "📝",
	browser: "🌐"
};
/** Typing in a name or address field keeps its own keys. */
var isTextField = (target) => target instanceof HTMLElement && (target.isContentEditable || [
	"INPUT",
	"TEXTAREA",
	"SELECT"
].includes(target.tagName));
var startState = (scenario, ops) => {
	const begin = buildState(scenario.start, scenario.drives);
	const replayed = replay(begin, ops);
	const state = initialState(replayed.ok ? replayed.state : begin, scenario.app !== void 0);
	return replayed.ok ? {
		...state,
		ops
	} : state;
};
/** The whole trainer for one scenario. Can be embedded into any React page. */
var EduDesktop = ({ scenario, onCheck, onChange, initialOps = [], selfCheck = true }) => {
	const [state, dispatch] = useReducer(reducer, null, () => startState(scenario, initialOps));
	const [taskOpen, setTaskOpen] = useState(true);
	const reset = useCallback(() => dispatch({
		type: "reset",
		fs: buildState(scenario.start, scenario.drives),
		withApp: scenario.app !== void 0
	}), [scenario]);
	const changed = useRef(onChange);
	useEffect(() => {
		changed.current = onChange;
	});
	useEffect(() => {
		changed.current?.(state.ops);
	}, [state.ops]);
	useEffect(() => {
		if (state.message === null) return;
		const timer = window.setTimeout(() => dispatch({ type: "dismiss" }), MESSAGE_MS);
		return () => window.clearTimeout(timer);
	}, [state.message]);
	useEffect(() => {
		if (state.results !== null) onCheck?.(allMet(state.results));
	}, [state.results, onCheck]);
	/**
	* Double tap: a folder opens in the same window (or a new one from the desktop), a file opens a viewer,
	* a shortcut opens its object.
	*/
	const open = useCallback((nodeId, fromWinId) => {
		const node = getNode(state.fs, nodeId);
		if (!node) return;
		if (nodeId !== "bin" && isInBin(state.fs, nodeId)) {
			dispatch({
				type: "notify",
				message: "Об'єкт у кошику. Щоб відкрити, спершу віднови його."
			});
			return;
		}
		if (node.target !== void 0) {
			const target = shortcutTarget(state.fs, node);
			if (target) open(target.id, fromWinId);
			else dispatch({
				type: "notify",
				message: "Ярлик не працює: об'єкт, на який він указує, видалено."
			});
			return;
		}
		if (node.kind === "folder" && fromWinId !== void 0) dispatch({
			type: "navigate",
			winId: fromWinId,
			nodeId
		});
		else dispatch({
			type: "open",
			nodeId
		});
	}, [state.fs]);
	/**
	* Where the student last clicked: a window id, the desktop, or `null` until they click inside the trainer,
	* so keys elsewhere on the page stay theirs.
	*/
	const focus = useRef(null);
	const rootRef = useRef(null);
	const onRootPointerDown = (e) => {
		const win = e.target.closest("[data-win-id]")?.getAttribute("data-win-id");
		focus.current = win ? Number(win) : "desktop";
	};
	useEffect(() => {
		const onPointerDown = (e) => {
			if (!rootRef.current?.contains(e.target)) focus.current = null;
		};
		const onKeyDown = (e) => {
			if (focus.current === null || state.confirm !== null || state.fileDialog !== null || isTextField(e.target)) return;
			const focused = state.windows.find((w) => w.id === focus.current && !w.minimized);
			const win = focus.current === "desktop" ? void 0 : focused ?? activeWin(state);
			const folderId = win?.nodeId ?? "desktop";
			if (getNode(state.fs, folderId)?.kind !== "folder") return;
			const command = commandForKey(state, {
				key: e.key,
				code: e.code,
				ctrl: e.ctrlKey || e.metaKey
			}, folderId);
			if (command === null) return;
			e.preventDefault();
			if (command.type === "openItem") open(command.nodeId, win?.id);
			else dispatch(command);
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [state, open]);
	const { bind, drag } = usePointer({
		onSelect: (nodeId, additive, range) => dispatch({
			type: "select",
			nodeId,
			additive,
			range
		}),
		onOpen: (nodeId) => {
			const parentId = getNode(state.fs, nodeId)?.parentId;
			open(nodeId, state.windows.find((w) => w.nodeId === parentId)?.id);
		},
		onMenu: (x, y, containerId, targetId) => {
			if (targetId !== null && !state.selected.includes(targetId)) dispatch({
				type: "select",
				nodeId: targetId,
				additive: false
			});
			dispatch({
				type: "menu",
				menu: {
					x,
					y,
					containerId,
					targetId
				}
			});
		},
		onDrop: (nodeId, targetId, copy) => dispatch({
			type: "drop",
			ids: state.selected.includes(nodeId) ? state.selected : [nodeId],
			targetId,
			copy
		}),
		onDropMenu: (x, y, nodeId, targetId) => {
			const ids = state.selected.includes(nodeId) ? state.selected : [nodeId];
			if (targetId === "bin") dispatch({
				type: "drop",
				ids,
				targetId,
				copy: false
			});
			else dispatch({
				type: "menu",
				menu: {
					x,
					y,
					containerId: targetId,
					targetId: null,
					drop: {
						ids,
						targetId
					}
				}
			});
		},
		isSoleSelected: (nodeId) => state.selected.length === 1 && state.selected[0] === nodeId,
		onRename: (nodeId) => dispatch({
			type: "startRename",
			nodeId
		})
	});
	const binHasItems = childrenOf(state.fs, "bin").length > 0;
	const active = activeWin(state);
	const desktopItems = [...[getNode(state.fs, THIS_PC_ID), getNode(state.fs, "bin")].filter((n) => n !== void 0), ...childrenOf(state.fs, DESKTOP_ID)];
	const dragged = drag ? getNode(state.fs, drag.nodeId) : void 0;
	const dragCount = drag && state.selected.includes(drag.nodeId) ? state.selected.length : 1;
	return /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		className: `ed-root ${scenario.large ? "ed-large" : ""}`,
		onPointerDownCapture: onRootPointerDown,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ed-desktop",
				children: [
					/* @__PURE__ */ jsx(ItemGrid, {
						state,
						containerId: DESKTOP_ID,
						items: desktopItems,
						bind,
						dispatch,
						variant: "desktop"
					}),
					state.windows.map((win, i) => {
						if (win.nodeId === "app" && scenario.app) return /* @__PURE__ */ jsx("div", {
							hidden: win.minimized,
							children: /* @__PURE__ */ jsx(Window, {
								win,
								title: appTitle(state, scenario.app),
								icon: /* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: APP_ICONS[scenario.app.kind]
								}),
								active: win.id === active?.id,
								zIndex: 10 + i,
								dispatch,
								children: /* @__PURE__ */ jsx(AppContent, {
									app: scenario.app,
									state,
									dispatch
								})
							})
						}, win.id);
						const node = getNode(state.fs, win.nodeId);
						if (!node || win.minimized) return null;
						return /* @__PURE__ */ jsx(Window, {
							win,
							title: titleOf(state, win.nodeId),
							icon: /* @__PURE__ */ jsx(NodeIcon, {
								kind: iconKindOf(node, binHasItems),
								size: 18
							}),
							active: win.id === active?.id,
							zIndex: 10 + i,
							dispatch,
							children: node.kind === "folder" ? /* @__PURE__ */ jsx(Explorer, {
								state,
								win,
								bind,
								dispatch
							}) : /* @__PURE__ */ jsxs("div", {
								className: "ed-viewer",
								children: [
									/* @__PURE__ */ jsx(NodeIcon, {
										kind: iconKindOf(node, false),
										size: 96
									}),
									/* @__PURE__ */ jsx("p", { children: node.name }),
									/* @__PURE__ */ jsx("small", { children: "У тренажері файли не відкриваються, з ними можна лише працювати як з об'єктами." })
								]
							})
						}, win.id);
					}),
					!taskOpen && /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ed-task-show",
						onClick: () => setTaskOpen(true),
						children: "📋 Завдання"
					}),
					/* @__PURE__ */ jsx(TaskPanel, {
						scenario,
						state,
						open: taskOpen,
						onToggle: () => setTaskOpen(false),
						onReset: reset,
						dispatch,
						selfCheck
					})
				]
			}),
			/* @__PURE__ */ jsxs("footer", {
				className: "ed-taskbar",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ed-start",
						onClick: () => setTaskOpen((v) => !v),
						"aria-label": "Завдання",
						children: "📋"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: `ed-multi ${state.multi ? "is-on" : ""}`,
						"aria-pressed": state.multi,
						onClick: () => dispatch({ type: "toggleMulti" }),
						title: "Кожне натискання додає об'єкт до виділених, як клацання з Ctrl",
						children: "☑ Вибрати кілька"
					}),
					state.windows.map((win) => /* @__PURE__ */ jsx("button", {
						type: "button",
						className: `ed-task-btn ${win.id === active?.id ? "is-active" : ""}`,
						onClick: () => dispatch({
							type: "taskbar",
							winId: win.id
						}),
						children: win.nodeId === "app" && scenario.app ? appTitle(state, scenario.app) : titleOf(state, win.nodeId)
					}, win.id)),
					scenario.app && !state.windows.some((w) => w.nodeId === "app") && /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "ed-task-btn",
						onClick: () => dispatch({ type: "openApp" }),
						children: [
							APP_ICONS[scenario.app.kind],
							" ",
							APPS[scenario.app.kind].title
						]
					})
				]
			}),
			state.fileDialog && scenario.app && /* @__PURE__ */ jsx(SaveDialog, {
				mode: state.fileDialog,
				state,
				app: scenario.app,
				dispatch
			}, state.fileDialog),
			state.confirm && /* @__PURE__ */ jsx(ConfirmDialog, {
				state,
				confirm: state.confirm,
				dispatch
			}),
			state.menu && /* @__PURE__ */ jsx(ContextMenu, {
				state,
				menu: state.menu,
				dispatch,
				onOpen: (id) => open(id)
			}),
			state.message && /* @__PURE__ */ jsx("div", {
				className: "ed-toast",
				role: "alert",
				onClick: () => dispatch({ type: "dismiss" }),
				children: state.message
			}),
			drag && dragged && /* @__PURE__ */ jsxs("div", {
				className: "ed-ghost",
				style: {
					left: drag.x,
					top: drag.y
				},
				children: [/* @__PURE__ */ jsx(ItemIcon, {
					fs: state.fs,
					node: dragged,
					binHasItems,
					size: 40
				}), /* @__PURE__ */ jsxs("span", { children: [drag.copy ? "＋ " : drag.right ? "? " : "", dragCount > 1 ? `${dragCount} об'єкти` : dragged.name] })]
			})
		]
	});
};
export { EduDesktop };
