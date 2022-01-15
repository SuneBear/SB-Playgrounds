/* overlays/PoemCollectionOverlay.svelte generated by Svelte v3.31.0 */
import {
	SvelteComponent,
	add_render_callback,
	append,
	attr,
	binding_callbacks,
	check_outros,
	create_bidirectional_transition,
	create_component,
	destroy_component,
	destroy_each,
	detach,
	element,
	group_outros,
	init,
	insert,
	listen,
	mount_component,
	safe_not_equal,
	set_style,
	space,
	toggle_class,
	transition_in,
	transition_out
} from "svelte/internal";

import * as MathUtil from "../util/math";
import createInput from "../util/tiny-input";
import { InvertedTokenURLs } from "../util/tokens";
import { fade } from "svelte/transition";
import { onMount, onDestroy } from "svelte";
import { createEventDispatcher } from "svelte";
import { localize, language } from "../util/locale.js";
import IconButton from "../components/IconButton.svelte";

// import paperJournalOne from "../assets/image/ui/ico_paperJournal1-rotated.png";
// import paperJournalTwo from "../assets/image/ui/ico_paperJournal2-rotated.png";
// import closeSquare from "../assets/image/ui/ico_closeJournal.png";
// import closeX from "../assets/image/ui/ico_XcloseJournal.png";
import scrollbar from "../assets/image/ui/ico_scrollbar.png";

import scrollbarSlider from "../assets/image/ui/ico_toggle.png";
import openJournal from "../assets/image/ui/ico_openjournal.png";
import HaikuCard from "../components/HaikuCard.svelte";
import Haiku from "../util/haikugen";
import CloseButton from "../components/CloseButton.svelte";
import PoemTagButton from "../components/PoemTagButton.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	child_ctx[17] = i;
	return child_ctx;
}

// (134:6) {#each poems as poem, i}
function create_each_block(ctx) {
	let haikucard;
	let current;

	haikucard = new HaikuCard({
			props: {
				tokens: /*poem*/ ctx[15].tokens,
				lines: /*poem*/ ctx[15].lines
			}
		});

	return {
		c() {
			create_component(haikucard.$$.fragment);
		},
		m(target, anchor) {
			mount_component(haikucard, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const haikucard_changes = {};
			if (dirty & /*poems*/ 2) haikucard_changes.tokens = /*poem*/ ctx[15].tokens;
			if (dirty & /*poems*/ 2) haikucard_changes.lines = /*poem*/ ctx[15].lines;
			haikucard.$set(haikucard_changes);
		},
		i(local) {
			if (current) return;
			transition_in(haikucard.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(haikucard.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(haikucard, detaching);
		}
	};
}

function create_fragment(ctx) {
	let div5;
	let div1;
	let poemtagbutton;
	let t0;
	let div0;
	let t1;
	let closebutton;
	let t2;
	let div4;
	let div3;
	let div2;
	let img;
	let img_src_value;
	let img_draggable_value;
	let div5_transition;
	let current;
	let mounted;
	let dispose;
	poemtagbutton = new PoemTagButton({ props: { button: false } });
	let each_value = /*poems*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	closebutton = new CloseButton({});
	closebutton.$on("click", /*close*/ ctx[8]);

	return {
		c() {
			div5 = element("div");
			div1 = element("div");
			create_component(poemtagbutton.$$.fragment);
			t0 = space();
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			create_component(closebutton.$$.fragment);
			t2 = space();
			div4 = element("div");
			div3 = element("div");
			div2 = element("div");
			img = element("img");
			attr(div0, "class", "poem-collection-container svelte-1iw8zw5");
			attr(div1, "class", "scroller svelte-1iw8zw5");
			if (img.src !== (img_src_value = scrollbarSlider)) attr(img, "src", img_src_value);
			attr(img, "alt", "");
			attr(img, "draggable", img_draggable_value = false);
			attr(img, "class", "svelte-1iw8zw5");
			attr(div2, "class", "scrollbar-trackbar-thumb svelte-1iw8zw5");
			set_style(div2, "top", /*newScrollY*/ ctx[4]);
			attr(div3, "class", "scrollbar-trackbar svelte-1iw8zw5");
			set_style(div3, "background-image", "url(" + scrollbar + ")");
			attr(div4, "class", "scrollbar-container svelte-1iw8zw5");
			toggle_class(div4, "hideScrollbar", /*hideScrollbar*/ ctx[2]);
			attr(div5, "class", "container svelte-1iw8zw5");
			toggle_class(div5, "modal", /*modal*/ ctx[0]);
			toggle_class(div5, "ignorePointer", /*ignorePointer*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, div5, anchor);
			append(div5, div1);
			mount_component(poemtagbutton, div1, null);
			append(div1, t0);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			/*div1_binding*/ ctx[9](div1);
			append(div5, t1);
			mount_component(closebutton, div5, null);
			append(div5, t2);
			append(div5, div4);
			append(div4, div3);
			append(div3, div2);
			append(div2, img);
			/*div3_binding*/ ctx[10](div3);
			current = true;

			if (!mounted) {
				dispose = listen(div1, "scroll", /*scrollUpdate*/ ctx[7]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*poems*/ 2) {
				each_value = /*poems*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*newScrollY*/ 16) {
				set_style(div2, "top", /*newScrollY*/ ctx[4]);
			}

			if (dirty & /*hideScrollbar*/ 4) {
				toggle_class(div4, "hideScrollbar", /*hideScrollbar*/ ctx[2]);
			}

			if (dirty & /*modal*/ 1) {
				toggle_class(div5, "modal", /*modal*/ ctx[0]);
			}

			if (dirty & /*ignorePointer*/ 8) {
				toggle_class(div5, "ignorePointer", /*ignorePointer*/ ctx[3]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(poemtagbutton.$$.fragment, local);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(closebutton.$$.fragment, local);

			add_render_callback(() => {
				if (!div5_transition) div5_transition = create_bidirectional_transition(div5, fade, { duration: 500 }, true);
				div5_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(poemtagbutton.$$.fragment, local);
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(closebutton.$$.fragment, local);
			if (!div5_transition) div5_transition = create_bidirectional_transition(div5, fade, { duration: 500 }, false);
			div5_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div5);
			destroy_component(poemtagbutton);
			destroy_each(each_blocks, detaching);
			/*div1_binding*/ ctx[9](null);
			destroy_component(closebutton);
			/*div3_binding*/ ctx[10](null);
			if (detaching && div5_transition) div5_transition.end();
			mounted = false;
			dispose();
		}
	};
}

let narrow = false;

function instance($$self, $$props, $$invalidate) {
	let { modal = false } = $$props;
	let { poems = [] } = $$props;

	// const haiku = Haiku();
	// let poems = Array(6)
	//   .fill()
	//   .map(() => {
	//     const tokens = haiku.randomTokens();
	//     return {
	//       tokens,
	//       lines: haiku.generate({ tokens }),
	//     };
	//   });
	const dispatch = createEventDispatcher();

	let hideScrollbar = false;
	let ignorePointer = false;

	// let trackBarElement;
	let newScrollY = "0%";

	let scrollContainerElement;
	let scrollbarElement;

	// $: narrow = poems.length <= 3;
	onMount(() => {
		$$invalidate(3, ignorePointer = false);
		scrollUpdate();
		window.addEventListener("resize", resize, { passive: true });
		const destroyDrag = drag(scrollbarElement);

		return () => {
			destroyDrag();
			window.removeEventListener("resize", resize);
		};
	});

	function resize() {
		scrollUpdate();
	}

	function needsScrollbar() {
		return scrollContainerElement.scrollHeight > scrollContainerElement.clientHeight;
	}

	function scrollUpdate() {
		if (!scrollContainerElement) return;
		const v = scrollContainerElement.scrollTop / (scrollContainerElement.scrollHeight - scrollContainerElement.clientHeight);

		// trackBarElement.style.top
		$$invalidate(4, newScrollY = `${(v * 100).toFixed(5)}%`);

		$$invalidate(2, hideScrollbar = !needsScrollbar());
	}

	function drag(el) {
		const input = createInput({ target: el, parent: window });
		input.on("down", onInput).on("up", onInput).on("move", onInput);

		// on unmount
		return () => {
			input.disable();
		};

		function onInput(ev) {
			if (ev.dragging && scrollContainerElement) {
				updateSlider(ev.uv[1]);
			}
		}

		function updateSlider(v) {
			v = MathUtil.clamp01(v);
			const px = v * (scrollContainerElement.scrollHeight - scrollContainerElement.clientHeight);
			$$invalidate(5, scrollContainerElement.scrollTop = px, scrollContainerElement);
		}
	}

	function close() {
		$$invalidate(3, ignorePointer = true);
		dispatch("close");
		console.log("Poems Collection closed");
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			scrollContainerElement = $$value;
			$$invalidate(5, scrollContainerElement);
		});
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			scrollbarElement = $$value;
			$$invalidate(6, scrollbarElement);
		});
	}

	$$self.$$set = $$props => {
		if ("modal" in $$props) $$invalidate(0, modal = $$props.modal);
		if ("poems" in $$props) $$invalidate(1, poems = $$props.poems);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*poems*/ 2) {
			$: (poems, $$invalidate(3, ignorePointer = false));
		}
	};

	return [
		modal,
		poems,
		hideScrollbar,
		ignorePointer,
		newScrollY,
		scrollContainerElement,
		scrollbarElement,
		scrollUpdate,
		close,
		div1_binding,
		div3_binding
	];
}

class PoemCollectionOverlay extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { modal: 0, poems: 1 });
	}
}

export default PoemCollectionOverlay;