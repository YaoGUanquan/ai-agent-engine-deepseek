window.__ModuleLoader__.load({id:"ai-agent-engine-deepseek",factory:(require)=>{var module={exports:{}};var exports=module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// harness-client:agent-team-client
var require_agent_team_client = __commonJS({
  "harness-client:agent-team-client"(exports, module2) {
    module2.exports = ((require2) => {
      var module3 = { exports: {} };
      var exports2 = module3.exports;
      Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
      let react_jsx_runtime = require2("react/jsx-runtime");
      let react = require2("react");
      let react_dom = require2("react-dom");
      let _deepseek_ai_dsh_client_ui_primitives = require2("@deepseek-ai/dsh-client-ui-primitives");
      const css = '.VoX2oq_root{position:relative}.VoX2oq_trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:5px;padding:3px 7px;font-size:12px;display:inline-flex}.VoX2oq_trigger:hover,.VoX2oq_trigger:focus-visible{color:var(--dsw-alias-label-primary)}@container (width<=480px){.VoX2oq_triggerLabel{display:none}}.VoX2oq_count{color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;font-size:12px;font-weight:400;line-height:16px}.VoX2oq_panel{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);z-index:100;box-sizing:border-box;--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:min(500px,100vw - 32px);max-height:min(680px,100vh - 32px);box-shadow:var(--dsw-elevation-prominent);border:0;border-radius:12px;flex-direction:column;padding:8px 2px 0;display:flex;position:fixed;overflow:hidden}.VoX2oq_panel:before{content:"";z-index:-1;background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);border-radius:12px;position:absolute;inset:0}.VoX2oq_panelCompact{width:min(320px,100vw - 32px)}.VoX2oq_panelCompact .VoX2oq_roster{grid-template-columns:minmax(0,1fr)}.VoX2oq_body{--dsh-scrollbar-track-margin:8px;scrollbar-gutter:stable;flex:auto;min-height:0;padding:0 9px 16px 14px;overflow-y:auto}.VoX2oq_taskTitle{align-items:center;gap:8px;display:flex}.VoX2oq_taskTitle strong{font-size:13px;font-weight:500}.VoX2oq_panel h3{color:var(--dsw-alias-label-primary);align-items:center;gap:8px;margin:16px 0 8px 4px;font-size:13px;font-weight:500;display:flex}.VoX2oq_body section:first-of-type h3{margin-top:8px}.VoX2oq_roster{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;display:grid}.VoX2oq_member{--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);min-width:0;box-shadow:var(--dsw-elevation-stroke);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;border:0;border-radius:8px;align-items:flex-start;gap:8px;padding:10px 12px;display:flex}.VoX2oq_member:disabled{cursor:default}.VoX2oq_memberCurrent{--dsw-elevation-stroke-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);box-shadow:var(--dsw-elevation-stroke), inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent)}.VoX2oq_member:not(:disabled):hover,.VoX2oq_member:not(:disabled):focus-visible{--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);box-shadow:var(--dsw-elevation-panel)}.VoX2oq_memberDot{flex:none;align-items:center;height:1lh;display:inline-flex}.VoX2oq_inactiveIcon{color:var(--dsw-alias-label-tertiary)}.VoX2oq_memberText{flex-direction:column;min-width:0;display:flex}.VoX2oq_memberName{align-items:center;gap:5px;min-width:0;display:inline-flex}.VoX2oq_memberNameText,.VoX2oq_memberText small{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.VoX2oq_memberModel{display:none}.VoX2oq_member:hover .VoX2oq_memberModel,.VoX2oq_member:focus-visible .VoX2oq_memberModel{display:inline}.VoX2oq_currentTag{text-overflow:ellipsis;flex:0 999 auto;min-width:0;padding:0 4px;font-size:10px;line-height:15px;display:inline-block;overflow:hidden}.VoX2oq_memberText small,.VoX2oq_meta{color:var(--dsw-alias-label-tertiary);font-size:11px}.VoX2oq_diagnostic,.VoX2oq_error,.VoX2oq_warning{color:var(--dsw-alias-state-error-primary)}.VoX2oq_tasks{flex-direction:column;gap:7px;display:flex}.VoX2oq_emptyNotice{color:var(--dsw-alias-label-tertiary);margin:16px 0 0 4px;font-size:12px}.VoX2oq_task{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:9px;padding:11px 13px}.VoX2oq_taskState{color:var(--dsw-alias-label-tertiary);align-items:center;gap:6px;margin-left:auto;font-size:11px;display:inline-flex}.VoX2oq_task p{color:var(--dsw-alias-label-secondary);white-space:pre-wrap;margin:5px 0;font-size:12px;line-height:18px}.VoX2oq_clampedDescription{-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.VoX2oq_expandToggle{float:right;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;align-items:center;gap:2px;margin-left:10px;padding:0;font-size:11px;line-height:20px;display:inline-flex}.VoX2oq_expandToggle:hover,.VoX2oq_expandToggle:focus-visible{color:var(--dsw-alias-label-primary)}.VoX2oq_expandToggle svg{transition:transform .12s}.VoX2oq_expandToggleOpen{transform:rotate(180deg)}.VoX2oq_meta{line-height:20px}.VoX2oq_meta>span{margin-right:10px}.VoX2oq_notice,.VoX2oq_error{align-items:center;gap:6px;padding:9px;font-size:12px;display:flex}';
      const tagId = "@deepseek-ai/dsh-experimental-client-ui-agent-team/TeamAction.module.css";
      if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
        const tag = document.createElement("style");
        tag.dataset.plugin = "@deepseek-ai/dsh-experimental-client-ui-agent-team";
        tag.dataset.pluginCss = tagId;
        tag.textContent = css;
        document.head.appendChild(tag);
      }
      var TeamAction_module_css_default = {
        "body": "VoX2oq_body",
        "clampedDescription": "VoX2oq_clampedDescription",
        "count": "VoX2oq_count",
        "currentTag": "VoX2oq_currentTag",
        "diagnostic": "VoX2oq_diagnostic",
        "emptyNotice": "VoX2oq_emptyNotice",
        "error": "VoX2oq_error",
        "expandToggle": "VoX2oq_expandToggle",
        "expandToggleOpen": "VoX2oq_expandToggleOpen",
        "inactiveIcon": "VoX2oq_inactiveIcon",
        "member": "VoX2oq_member",
        "memberCurrent": "VoX2oq_memberCurrent",
        "memberDot": "VoX2oq_memberDot",
        "memberModel": "VoX2oq_memberModel",
        "memberName": "VoX2oq_memberName",
        "memberNameText": "VoX2oq_memberNameText",
        "memberText": "VoX2oq_memberText",
        "meta": "VoX2oq_meta",
        "notice": "VoX2oq_notice",
        "panel": "VoX2oq_panel",
        "panelCompact": "VoX2oq_panelCompact",
        "root": "VoX2oq_root",
        "roster": "VoX2oq_roster",
        "task": "VoX2oq_task",
        "taskState": "VoX2oq_taskState",
        "taskTitle": "VoX2oq_taskTitle",
        "tasks": "VoX2oq_tasks",
        "trigger": "VoX2oq_trigger",
        "triggerLabel": "VoX2oq_triggerLabel",
        "warning": "VoX2oq_warning"
      };
      function statusKey(status2) {
        switch (status2) {
          case "pending":
            return "status.pending";
          case "in_progress":
            return "status.in_progress";
          case "completed":
            return "status.completed";
          /* v8 ignore next -- Team views omit deleted task tombstones. */
          case "deleted":
            return "status.completed";
        }
      }
      function memberStatusKey(status2) {
        switch (status2) {
          case "running":
            return "memberStatus.running";
          case "inactive":
            return "memberStatus.inactive";
          case "provisioning":
            return "memberStatus.provisioning";
          case "failed":
            return "memberStatus.failed";
        }
      }
      function memberDotState(status2) {
        switch (status2) {
          case "running":
          case "provisioning":
            return "ongoing";
          case "failed":
            return "error";
        }
      }
      function taskDotState(task) {
        switch (task.status) {
          case "pending":
            return task.ready ? "idle" : "warning";
          case "in_progress":
            return "ongoing";
          case "completed":
            return "done";
          /* v8 ignore next -- Team views omit deleted task tombstones. */
          case "deleted":
            return "idle";
        }
      }
      function TeamMemberRow({ member, memberCount, sessionId, useSessions, useSessionStatus, openTeammate, onError, t }) {
        const model = useSessions((state2) => state2.projectionsBySession[member.id]?.values.modelSelection?.next?.model);
        const running = useSessionStatus((state2) => state2.get(member.id)?.running);
        const summaryRunning = useSessions((state2) => state2.byId[member.id]?.running);
        const status2 = member.phase === "active" ? (running ?? summaryRunning) === true ? "running" : "inactive" : member.phase;
        const isCurrent = member.id === sessionId;
        const highlightCurrent = isCurrent && memberCount > 1;
        const inert = isCurrent || status2 === "failed" || status2 === "provisioning";
        return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
          label: t("open"),
          side: "bottom",
          gap: 4,
          disabled: inert,
          children: (0, react_jsx_runtime.jsxs)("button", {
            type: "button",
            className: highlightCurrent ? "".concat(TeamAction_module_css_default.member, " ").concat(TeamAction_module_css_default.memberCurrent) : TeamAction_module_css_default.member,
            disabled: inert,
            onClick: () => {
              try {
                openTeammate(sessionId, member.id);
              } catch (reason) {
                onError(String(reason));
              }
            },
            children: [(0, react_jsx_runtime.jsx)("span", {
              className: TeamAction_module_css_default.memberDot,
              children: status2 === "inactive" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutlineRegular, {
                size: 14,
                className: TeamAction_module_css_default.inactiveIcon
              }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: memberDotState(status2) })
            }), (0, react_jsx_runtime.jsxs)("span", {
              className: TeamAction_module_css_default.memberText,
              children: [
                (0, react_jsx_runtime.jsxs)("span", {
                  className: TeamAction_module_css_default.memberName,
                  children: [(0, react_jsx_runtime.jsx)("span", {
                    className: TeamAction_module_css_default.memberNameText,
                    children: member.name
                  }), isCurrent && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
                    tone: "info",
                    className: TeamAction_module_css_default.currentTag,
                    children: t("current")
                  })]
                }),
                (0, react_jsx_runtime.jsxs)("small", { children: [t(memberStatusKey(status2)), model !== void 0 && (0, react_jsx_runtime.jsx)("span", {
                  className: TeamAction_module_css_default.memberModel,
                  children: " \xB7 ".concat(t("model"), ": ").concat(model)
                })] }),
                member.error !== void 0 && (0, react_jsx_runtime.jsx)("small", {
                  className: TeamAction_module_css_default.diagnostic,
                  children: member.error
                })
              ]
            })]
          })
        });
      }
      function TaskCard({ task, t }) {
        const [expanded, setExpanded] = (0, react.useState)(false);
        const [clamped, setClamped] = (0, react.useState)(false);
        const textRef = (0, react.useRef)(null);
        (0, react.useLayoutEffect)(() => {
          if (expanded) return;
          const paragraph = textRef.current;
          if (paragraph === null) return;
          const measure = () => {
            setClamped(paragraph.scrollHeight > paragraph.clientHeight + 1);
          };
          measure();
          if (typeof ResizeObserver === "undefined") return;
          const observer = new ResizeObserver(measure);
          observer.observe(paragraph);
          return () => {
            observer.disconnect();
          };
        }, [task.description, expanded]);
        return (0, react_jsx_runtime.jsxs)("article", {
          className: TeamAction_module_css_default.task,
          children: [
            (0, react_jsx_runtime.jsxs)("div", {
              className: TeamAction_module_css_default.taskTitle,
              children: [(0, react_jsx_runtime.jsx)("strong", { children: task.subject }), (0, react_jsx_runtime.jsxs)("span", {
                className: TeamAction_module_css_default.taskState,
                children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: taskDotState(task) }), (0, react_jsx_runtime.jsx)("span", { children: t(statusKey(task.status)) })]
              })]
            }),
            (0, react_jsx_runtime.jsx)("p", {
              ref: textRef,
              className: expanded ? void 0 : TeamAction_module_css_default.clampedDescription,
              children: task.description
            }),
            (0, react_jsx_runtime.jsxs)("div", {
              className: TeamAction_module_css_default.meta,
              children: [
                (clamped || expanded) && (0, react_jsx_runtime.jsxs)("button", {
                  type: "button",
                  className: TeamAction_module_css_default.expandToggle,
                  "aria-expanded": expanded,
                  onClick: () => {
                    setExpanded((current) => !current);
                  },
                  children: [t(expanded ? "task.collapse" : "task.expand"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
                    size: 12,
                    className: expanded ? TeamAction_module_css_default.expandToggleOpen : void 0
                  })]
                }),
                (0, react_jsx_runtime.jsx)("span", { children: task.id }),
                (0, react_jsx_runtime.jsxs)("span", { children: [
                  t("owner"),
                  ": ",
                  task.ownerName ?? t("unowned")
                ] }),
                task.status === "pending" && (0, react_jsx_runtime.jsx)("span", { children: task.ready ? t("ready") : t("blocked") }),
                task.blockedBy.length > 0 && (0, react_jsx_runtime.jsxs)("span", { children: [
                  t("blockedBy"),
                  ": ",
                  task.blockedBy.join(", ")
                ] }),
                task.writeScopes.length > 0 && (0, react_jsx_runtime.jsxs)("span", { children: [
                  t("writeScopes"),
                  ": ",
                  task.writeScopes.join(", ")
                ] }),
                task.writeScopeWarnings.map((warning) => (0, react_jsx_runtime.jsx)("span", {
                  className: TeamAction_module_css_default.warning,
                  children: warning
                }, warning))
              ]
            })
          ]
        });
      }
      function TeamAction({ sessionId, useSession, useSessions, useSessionStatus, openTeammate, t }) {
        const [open, setOpen] = (0, react.useState)(false);
        const [error, setError] = (0, react.useState)(null);
        const rootRef = (0, react.useRef)(null);
        const triggerRef = (0, react.useRef)(null);
        const triggerLabelRef = (0, react.useRef)(null);
        const panelRef = (0, react.useRef)(null);
        const position = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
          open,
          anchorRef: triggerRef,
          panelRef,
          gap: 5,
          margin: 16
        });
        const positioned = position !== null;
        const leadSessionId = useSession((snapshot) => snapshot.subagent?.address.parentSessionId) ?? sessionId;
        const team = useSessions((state2) => state2.projectionsBySession[leadSessionId]?.values.agentTeam);
        const opening = useSession((snapshot) => snapshot.openState === "loading");
        const listing = useSessions((state2) => state2.phase === "pending");
        const hoverTimer = (0, react.useRef)(void 0);
        const pinnedRef = (0, react.useRef)(false);
        const cancelHoverChange = () => {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = void 0;
        };
        (0, react.useEffect)(() => {
          cancelHoverChange();
          pinnedRef.current = false;
          setOpen(false);
          setError(null);
        }, [sessionId]);
        (0, react.useEffect)(() => cancelHoverChange, []);
        (0, react.useLayoutEffect)(() => {
          if (open && positioned && pinnedRef.current) panelRef.current?.focus();
        }, [open, positioned]);
        const changeOpen = (next) => {
          cancelHoverChange();
          if (!next) pinnedRef.current = false;
          setOpen(next);
        };
        const scheduleHoverOpen = () => {
          cancelHoverChange();
          if (open) return;
          const label = triggerLabelRef.current;
          if (label === null) return;
          if (getComputedStyle(label).display === "none") return;
          hoverTimer.current = setTimeout(() => {
            hoverTimer.current = void 0;
            changeOpen(true);
          }, 150);
        };
        const scheduleHoverClose = () => {
          cancelHoverChange();
          if (pinnedRef.current) return;
          hoverTimer.current = setTimeout(() => {
            hoverTimer.current = void 0;
            changeOpen(false);
          }, 120);
        };
        (0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, changeOpen, panelRef);
        (0, react.useEffect)(() => {
          if (!open) return;
          const dismiss = (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            cancelHoverChange();
            pinnedRef.current = false;
            setOpen(false);
            if (panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
          };
          document.addEventListener("keydown", dismiss);
          return () => {
            document.removeEventListener("keydown", dismiss);
          };
        }, [open]);
        const compact = team !== void 0 && team.members.length === 1 && team.tasks.length === 0;
        return (0, react_jsx_runtime.jsxs)("div", {
          ref: rootRef,
          className: TeamAction_module_css_default.root,
          "data-team-action": true,
          onMouseLeave: scheduleHoverClose,
          children: [(0, react_jsx_runtime.jsxs)("button", {
            type: "button",
            ref: triggerRef,
            onMouseEnter: scheduleHoverOpen,
            className: TeamAction_module_css_default.trigger,
            "aria-label": t("trigger"),
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            onClick: () => {
              cancelHoverChange();
              pinnedRef.current = true;
              if (!open) changeOpen(true);
              else panelRef.current?.focus();
            },
            children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUsersOutlineRegular, { size: 14 }), (0, react_jsx_runtime.jsx)("span", {
              ref: triggerLabelRef,
              className: TeamAction_module_css_default.triggerLabel,
              children: t("trigger")
            })]
          }), open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("div", {
            ref: panelRef,
            className: compact ? "".concat(TeamAction_module_css_default.panel, " ").concat(TeamAction_module_css_default.panelCompact) : TeamAction_module_css_default.panel,
            style: position ?? {
              visibility: "hidden",
              left: 0,
              top: 0
            },
            role: "dialog",
            tabIndex: -1,
            "aria-label": t("trigger"),
            "data-team-panel": true,
            onMouseEnter: cancelHoverChange,
            onMouseLeave: scheduleHoverClose,
            children: (0, react_jsx_runtime.jsxs)("div", {
              className: TeamAction_module_css_default.body,
              children: [
                error !== null && (0, react_jsx_runtime.jsxs)("div", {
                  className: TeamAction_module_css_default.error,
                  role: "alert",
                  children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), error]
                }),
                team === void 0 && (0, react_jsx_runtime.jsxs)("div", {
                  className: TeamAction_module_css_default.notice,
                  role: "status",
                  children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: opening || listing ? "ongoing" : "warning" }), t(opening || listing ? "loading" : "unavailable")]
                }),
                team !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
                  team.failure !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
                    className: TeamAction_module_css_default.error,
                    role: "alert",
                    children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t("failure", { message: team.failure })]
                  }),
                  (0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsxs)("h3", { children: [t("roster"), team.members.length > 1 && (0, react_jsx_runtime.jsx)("span", {
                    className: TeamAction_module_css_default.count,
                    children: team.members.length
                  })] }), (0, react_jsx_runtime.jsx)("div", {
                    className: TeamAction_module_css_default.roster,
                    children: team.members.map((member) => (0, react_jsx_runtime.jsx)(TeamMemberRow, {
                      member,
                      memberCount: team.members.length,
                      sessionId,
                      useSessions,
                      useSessionStatus,
                      openTeammate,
                      onError: setError,
                      t
                    }, member.id))
                  })] }),
                  (0, react_jsx_runtime.jsx)("section", { children: team.tasks.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
                    className: TeamAction_module_css_default.emptyNotice,
                    children: t("empty")
                  }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("h3", { children: [t("tasks"), (0, react_jsx_runtime.jsx)("span", {
                    className: TeamAction_module_css_default.count,
                    children: team.tasks.length
                  })] }), (0, react_jsx_runtime.jsx)("div", {
                    className: TeamAction_module_css_default.tasks,
                    children: team.tasks.map((task) => (0, react_jsx_runtime.jsx)(TaskCard, {
                      task,
                      t
                    }, task.id))
                  })] }) })
                ] })
              ]
            })
          }), document.body)]
        });
      }
      const NS = "agent-team";
      const zh2 = {
        trigger: "\u667A\u80FD\u4F53\u56E2\u961F",
        loading: "\u6B63\u5728\u52A0\u8F7D\u56E2\u961F\u2026",
        unavailable: "Team \u6682\u4E0D\u53EF\u7528",
        failure: "\u56E2\u961F\u6301\u4E45\u8BB0\u5F55\u65E0\u6548\uFF1A{message}",
        empty: "\u6682\u65E0\u5171\u4EAB\u4EFB\u52A1\uFF0C\u53EF\u4EE5\u901A\u8FC7\u5BF9\u8BDD\u521B\u5EFA",
        roster: "\u6210\u5458",
        tasks: "\u5171\u4EAB\u4EFB\u52A1",
        model: "\u6A21\u578B",
        open: "\u6253\u5F00\u6210\u5458\u4F1A\u8BDD",
        current: "\u5F53\u524D\u4F1A\u8BDD",
        owner: "Owner",
        unowned: "\u672A\u5206\u914D",
        blockedBy: "\u4F9D\u8D56",
        writeScopes: "\u5199\u5165\u8303\u56F4",
        ready: "\u53EF\u5F00\u59CB",
        blocked: "\u88AB\u4F9D\u8D56\u963B\u585E",
        "task.expand": "\u5C55\u5F00",
        "task.collapse": "\u6536\u8D77",
        "memberStatus.running": "\u8FD0\u884C\u4E2D",
        "memberStatus.inactive": "\u672A\u8FD0\u884C",
        "memberStatus.provisioning": "\u51C6\u5907\u4E2D",
        "memberStatus.failed": "\u5931\u8D25",
        "status.pending": "\u5F85\u5904\u7406",
        "status.in_progress": "\u8FDB\u884C\u4E2D",
        "status.completed": "\u5DF2\u5B8C\u6210"
      };
      const en2 = {
        trigger: "Agent Team",
        loading: "Loading Team\u2026",
        unavailable: "Team is unavailable",
        failure: "Invalid persisted Team record: {message}",
        empty: "No shared tasks yet. Create them through the conversation.",
        roster: "Members",
        tasks: "Shared tasks",
        model: "Model",
        open: "Open member conversation",
        current: "Current chat",
        owner: "Owner",
        unowned: "Unowned",
        blockedBy: "Blocked by",
        writeScopes: "Write scopes",
        ready: "Ready",
        blocked: "Blocked by dependencies",
        "task.expand": "Show more",
        "task.collapse": "Show less",
        "memberStatus.running": "Running",
        "memberStatus.inactive": "Inactive",
        "memberStatus.provisioning": "Provisioning",
        "memberStatus.failed": "Failed",
        "status.pending": "Pending",
        "status.in_progress": "In progress",
        "status.completed": "Completed"
      };
      const inject2 = [
        "sessions",
        "uiWorkspace",
        "slots",
        "locale"
      ];
      function registerAgentTeamUi(ctx) {
        ctx.effect(() => ctx.locale.register(NS, {
          zh: zh2,
          en: en2
        }), "client-ui-agent-team: dictionaries");
        const sessions = ctx.sessions;
        const leadSessionId = (sessionId) => {
          return sessions.binding(sessionId)?.session.getSnapshot().subagent?.address?.parentSessionId ?? sessionId;
        };
        const actions = { openTeammate(sessionId, childSessionId) {
          const parentSessionId = leadSessionId(sessionId);
          if ((sessions.retainInfo(sessionId).getSnapshot().retainedBy.mainView ?? 0) === 0) return;
          if (childSessionId === parentSessionId) {
            ctx.uiWorkspace.openSession(parentSessionId);
            return;
          }
          ctx.uiWorkspace.openSession({
            parentSessionId,
            childSessionId,
            mode: "continuable"
          });
        } };
        ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
          name: "conversation.session.header.actions",
          id: "agent-team",
          order: -20,
          locale: NS,
          inject: () => actions
        }, TeamAction));
      }
      function apply2(ctx) {
        registerAgentTeamUi(ctx);
      }
      exports2.apply = apply2;
      exports2.inject = inject2;
      return module3.exports;
    })(require);
  }
});

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  DeletionDialog: () => DeletionDialog,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react5 = require("react");
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/deletion-state.ts
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");
function createDeletionController(remote, onDeleted) {
  const state2 = (0, import_dsh_client_store.createSnapshotStore)(null);
  let generation = 0;
  let disposed = false;
  async function request(sessionId, displayTitle) {
    if (state2.getSnapshot()?.phase === "deleting" || disposed) return;
    const current = ++generation;
    state2.set({ sessionId, displayTitle, phase: "loading" });
    if (typeof remote.deletePreview !== "function" || typeof remote.delete !== "function") {
      state2.set({ sessionId, displayTitle, phase: "error", unavailable: true });
      return;
    }
    try {
      const result2 = await remote.deletePreview({ sessionId });
      if (!result2.ok) throw result2.error;
      const preview2 = result2.value;
      if (!disposed && current === generation) state2.set({ sessionId, displayTitle, phase: "confirm", preview: preview2 });
    } catch (error) {
      if (disposed || current !== generation) return;
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
      state2.set({
        sessionId,
        displayTitle,
        phase: "error",
        unavailable: /method-not-found|endpoint-not-found|namespace-not-found|not-available|method-unavailable|definition-unavailable|service-unavailable|delete-unsupported/.test(code)
      });
    }
  }
  async function confirm() {
    const current = state2.getSnapshot();
    if (disposed || current?.preview === void 0 || !["confirm", "error"].includes(current.phase) || typeof remote.delete !== "function") return;
    state2.set({ ...current, phase: "deleting" });
    try {
      const result2 = await remote.delete({ ...current.preview, stopRunning: true });
      if (!result2.ok) throw result2.error;
      const ids = result2.value;
      if (!disposed) {
        onDeleted(ids);
        state2.set(null);
      }
    } catch (error) {
      const changedScope = typeof error === "object" && error !== null && "code" in error && (error.code === "session/delete-scope-changed" || error.code === "ae-conversations/delete-scope-changed");
      const restartRequired = typeof error === "object" && error !== null && "code" in error && error.code === "ae-conversations/delete-restart-required";
      if (!disposed) state2.set(changedScope ? { sessionId: current.sessionId, displayTitle: current.displayTitle, phase: "error", changedScope: true } : { ...current, phase: "error", restartRequired });
    }
  }
  function close() {
    if (state2.getSnapshot()?.phase === "deleting") return;
    generation++;
    state2.set(null);
  }
  return {
    state: state2,
    request,
    confirm,
    close,
    dispose() {
      disposed = true;
      generation++;
      state2.set(null);
    }
  };
}

// src/locales.ts
var en = {
  "compatibility.section": "Plugin status",
  "compatibility.module": "Module",
  "compatibility.host": "Host",
  "compatibility.client": "Interface",
  "compatibility.engineering": "Engineering collaboration",
  "compatibility.roles": "Engineering roles",
  "compatibility.deletion": "Permanent deletion",
  "compatibility.update": "Version updates",
  "compatibility.ready": "Available",
  "compatibility.services": "Unavailable: waiting for Host services",
  "compatibility.interface": "Unavailable: incompatible Host interface",
  "compatibility.initialization": "Unavailable: initialization failed",
  "compatibility.storage": "Unavailable: unsupported storage or search index",
  "compatibility.unavailable": "Disabled",
  "compatibility.unreachable": "Host status unavailable",
  "role.lead": "Engineering lead",
  "role.requirements": "Requirements analyst",
  "role.frontend": "Frontend engineer",
  "role.backend": "Backend engineer",
  "role.unit-test": "Unit test engineer",
  "role.integration-test": "Integration test engineer",
  "role.browser-test": "Browser test engineer",
  "role.e2e-engineer": "E2E test engineer",
  delete: "Permanently delete",
  title: "Permanently delete conversation?",
  description: "This conversation and its owned teammate conversations will be permanently deleted. Independent forks and project files are retained.",
  conversation: "Conversation",
  related: "Related teammate conversations",
  running: "Running conversations will be stopped before deletion.",
  loading: "Checking conversation scope...",
  pending: "Stopping activity and deleting...",
  cancel: "Cancel",
  close: "Close",
  retry: "Check again",
  unsupported: "Permanent deletion is unavailable for this storage backend.",
  restart: "Restart Desktop once after enabling the plugin, then retry deletion.",
  failed: "Deletion did not complete. The Host may have committed part of the cleanup; retry this operation.",
  "roles.section": "Engineering roles",
  "roles.intro": "Edit the local roles.json overlay used by Lead policy. Display titles stay in locales; this page edits skill and responsibility only.",
  "roles.pathLabel": "Overlay path",
  "roles.pathUnavailable": "(unavailable)",
  "roles.sourceLabel": "Source",
  "roles.disabledHint": "rolesEnabled is off; overlay is ignored until re-enabled",
  "roles.skill": "Skill",
  "roles.responsibility": "Responsibility",
  "roles.custom": "custom",
  "roles.remove": "Remove",
  "roles.add": "Add role",
  "roles.newIdPlaceholder": "custom-role-id",
  "roles.save": "Save overlay",
  "roles.saving": "Saving\u2026",
  "roles.restore": "Restore defaults",
  "roles.reload": "Reload",
  "roles.loading": "Loading roles\u2026",
  "roles.saved": "Overlay saved. New teammates will use the merged catalog.",
  "roles.restored": "Overlay deleted. Builtin seed restored for new teammates.",
  "roles.loadFailed": "Failed to load roles",
  "roles.saveFailed": "Failed to save roles",
  "roles.invalidId": "Role id must be lowercase kebab-case and cannot be lead",
  changed: "The conversation family changed. Check the scope again and confirm the updated list.",
  "update.section": "Plugin updates",
  "update.intro": "Check the official release channel and install a newer plugin build in place. Downloads and installs are performed by the Host plugin manager; nothing else on this machine is changed.",
  "update.current": "Installed version",
  "update.latest": "Latest version",
  "update.runtime": "Harness runtime",
  "update.channel": "Update channel",
  "update.channelPackage": "Release package",
  "update.channelCheckout": "Git checkout",
  "update.check": "Check for updates",
  "update.checking": "Checking\u2026",
  "update.apply": "Update now",
  "update.downloading": "Downloading the release\u2026",
  "update.installing": "Installing the release\u2026",
  "update.rebuilding": "Updating the checkout and rebuilding\u2026",
  "update.applied": "Update installed",
  "update.idle": "Not checked yet.",
  "update.uptodate": "This is the latest published version.",
  "update.outdated": "A newer published version is available.",
  "update.restart": "Restart Desktop completely (including the tray instance) to load the new version.",
  "update.unknown": "unknown",
  "update.unavailable": "The Host update service is unavailable in this runtime.",
  "update.pendingCommits": "Upstream commits pending",
  "update.compatVerified": "This Harness version is included in the verified runtime list.",
  "update.compatNewer": "This Harness version is newer than the verified range. The plugin still loads and only lacks verification.",
  "update.compatOlder": "This Harness version is not in the verified runtime list. Some features may be unavailable.",
  "update.compatUnknown": "The Harness version could not be read; compatibility is unknown.",
  "update.blocked.busy": "An update is already running.",
  "update.blocked.no-plugin-manager": "The Host plugin manager is unavailable, so the plugin cannot install a package here.",
  "update.blocked.no-release": "The release channel lists no installable release.",
  "update.blocked.no-asset": "The release has no plugin tarball to install.",
  "update.blocked.checksum-mismatch": "The downloaded package failed SHA-256 verification; nothing was installed.",
  "update.blocked.incompatible-version": "The new build rejects this Harness version. Update Harness first or install a compatible build.",
  "update.blocked.dirty-worktree": "The checkout has local changes; commit or stash them before updating.",
  "update.blocked.no-upstream": "The current branch has no upstream to update from.",
  "update.blocked.no-update": "No newer version was found.",
  "update.blocked.checksum-missing": "The release has no SHA-256 checksum; installation was blocked.",
  "update.blocked.checksum-invalid": "The checksum file does not contain a valid digest for this package.",
  "update.blocked.package-identity-mismatch": "The package name or version does not match the selected release.",
  "update.blocked.install-failed": "The Host could not install the update. See the diagnostic below and retry.",
  "update.blocked.install-cancelled": "The Host cancelled the installation. No successful update was confirmed.",
  "update.blocked.install-overridden": "The installation is overridden by another configuration layer.",
  "update.blocked.checkout-changed": "The checkout changed during preparation. Check local changes before retrying.",
  "update.blocked.build-failed": "The prepared update could not be built. Retry after resolving the diagnostic.",
  "update.blocked.activation-failed": "The prepared update could not replace the installed files. Retry to finish.",
  "update.resumePending": "An unfinished checkout update is retained. Update now resumes its remaining steps.",
  "update.pendingBuilds": "These dependency build scripts need approval in the Host plugin manager:",
  "update.warning": "Installation notice"
};
var zh = {
  "compatibility.section": "\u63D2\u4EF6\u72B6\u6001",
  "compatibility.module": "\u6A21\u5757",
  "compatibility.host": "\u5BBF\u4E3B",
  "compatibility.client": "\u754C\u9762",
  "compatibility.engineering": "\u5DE5\u7A0B\u534F\u4F5C",
  "compatibility.roles": "\u5DE5\u7A0B\u89D2\u8272",
  "compatibility.deletion": "\u6C38\u4E45\u5220\u9664",
  "compatibility.update": "\u7248\u672C\u66F4\u65B0",
  "compatibility.ready": "\u53EF\u7528",
  "compatibility.services": "\u4E0D\u53EF\u7528\uFF1A\u7B49\u5F85\u5BBF\u4E3B\u670D\u52A1",
  "compatibility.interface": "\u4E0D\u53EF\u7528\uFF1A\u5BBF\u4E3B\u63A5\u53E3\u4E0D\u517C\u5BB9",
  "compatibility.initialization": "\u4E0D\u53EF\u7528\uFF1A\u521D\u59CB\u5316\u5931\u8D25",
  "compatibility.storage": "\u4E0D\u53EF\u7528\uFF1A\u5B58\u50A8\u6216\u641C\u7D22\u7D22\u5F15\u4E0D\u53D7\u652F\u6301",
  "compatibility.unavailable": "\u5DF2\u7981\u7528",
  "compatibility.unreachable": "\u65E0\u6CD5\u83B7\u53D6\u5BBF\u4E3B\u72B6\u6001",
  "role.lead": "\u5DE5\u7A0B\u8D1F\u8D23\u4EBA",
  "role.requirements": "\u9700\u6C42\u5206\u6790\u5E08",
  "role.frontend": "\u524D\u7AEF\u5DE5\u7A0B\u5E08",
  "role.backend": "\u540E\u7AEF\u5DE5\u7A0B\u5E08",
  "role.unit-test": "\u5355\u5143\u6D4B\u8BD5\u5DE5\u7A0B\u5E08",
  "role.integration-test": "\u96C6\u6210\u6D4B\u8BD5\u5DE5\u7A0B\u5E08",
  "role.browser-test": "\u6D4F\u89C8\u5668\u6D4B\u8BD5\u5DE5\u7A0B\u5E08",
  "role.e2e-engineer": "\u7AEF\u5230\u7AEF\u6D4B\u8BD5\u5DE5\u7A0B\u5E08",
  delete: "\u6C38\u4E45\u5220\u9664",
  title: "\u6C38\u4E45\u5220\u9664\u5BF9\u8BDD\uFF1F",
  description: "\u5C06\u6C38\u4E45\u5220\u9664\u6B64\u5BF9\u8BDD\u53CA\u5176\u6240\u5C5E\u961F\u53CB\u5BF9\u8BDD\uFF0C\u4FDD\u7559\u72EC\u7ACB\u5206\u53C9\u5BF9\u8BDD\u548C\u5DE5\u7A0B\u6587\u4EF6\u3002",
  conversation: "\u5BF9\u8BDD",
  related: "\u5173\u8054\u961F\u53CB\u5BF9\u8BDD",
  running: "\u5C06\u5148\u505C\u6B62\u6B63\u5728\u8FD0\u884C\u7684\u5BF9\u8BDD\uFF0C\u518D\u6267\u884C\u5220\u9664\u3002",
  loading: "\u6B63\u5728\u6838\u5BF9\u5220\u9664\u8303\u56F4\u2026",
  pending: "\u6B63\u5728\u505C\u6B62\u4EFB\u52A1\u5E76\u5220\u9664\u2026",
  cancel: "\u53D6\u6D88",
  close: "\u5173\u95ED",
  retry: "\u91CD\u65B0\u6838\u5BF9",
  unsupported: "\u5F53\u524D\u5B58\u50A8\u540E\u7AEF\u6682\u4E0D\u652F\u6301\u6C38\u4E45\u5220\u9664\u3002",
  restart: "\u8BF7\u5728\u542F\u7528\u63D2\u4EF6\u540E\u91CD\u542F\u4E00\u6B21 Desktop\uFF0C\u518D\u91CD\u8BD5\u5220\u9664\u3002",
  failed: "\u5220\u9664\u5C1A\u672A\u5B8C\u6210\uFF0C\u5BBF\u4E3B\u53EF\u80FD\u5DF2\u63D0\u4EA4\u90E8\u5206\u6E05\u7406\uFF1B\u8BF7\u91CD\u8BD5\u6B64\u64CD\u4F5C\u3002",
  "roles.section": "\u5DE5\u7A0B\u89D2\u8272",
  "roles.intro": "\u7F16\u8F91\u672C\u673A roles.json \u8986\u76D6\uFF08Lead \u7B56\u7565\u7528\uFF09\u3002\u56E2\u961F\u9762\u677F\u5C55\u793A\u540D\u4ECD\u7531 locales \u51B3\u5B9A\uFF1B\u672C\u9875\u53EA\u6539 skill \u4E0E responsibility\u3002",
  "roles.pathLabel": "\u8986\u76D6\u8DEF\u5F84",
  "roles.pathUnavailable": "\uFF08\u4E0D\u53EF\u7528\uFF09",
  "roles.sourceLabel": "\u6765\u6E90",
  "roles.disabledHint": "rolesEnabled \u5DF2\u5173\u95ED\uFF1B\u91CD\u65B0\u5F00\u542F\u524D\u4F1A\u5FFD\u7565 overlay",
  "roles.skill": "\u6280\u80FD",
  "roles.responsibility": "\u804C\u8D23",
  "roles.custom": "\u81EA\u5B9A\u4E49",
  "roles.remove": "\u79FB\u9664",
  "roles.add": "\u6DFB\u52A0\u89D2\u8272",
  "roles.newIdPlaceholder": "custom-role-id",
  "roles.save": "\u4FDD\u5B58\u8986\u76D6",
  "roles.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "roles.restore": "\u6062\u590D\u9ED8\u8BA4",
  "roles.reload": "\u91CD\u65B0\u52A0\u8F7D",
  "roles.loading": "\u6B63\u5728\u52A0\u8F7D\u89D2\u8272\u2026",
  "roles.saved": "\u8986\u76D6\u5DF2\u4FDD\u5B58\u3002\u65B0\u521B\u5EFA\u7684\u961F\u53CB\u5C06\u4F7F\u7528\u5408\u5E76\u540E\u7684\u76EE\u5F55\u3002",
  "roles.restored": "\u8986\u76D6\u5DF2\u5220\u9664\u3002\u65B0\u961F\u53CB\u5C06\u4F7F\u7528\u51FA\u5382\u79CD\u5B50\u3002",
  "roles.loadFailed": "\u52A0\u8F7D\u89D2\u8272\u5931\u8D25",
  "roles.saveFailed": "\u4FDD\u5B58\u89D2\u8272\u5931\u8D25",
  "roles.invalidId": "\u89D2\u8272 id \u987B\u4E3A\u5C0F\u5199 kebab-case\uFF0C\u4E14\u4E0D\u80FD\u4E3A lead",
  changed: "\u5173\u8054\u5BF9\u8BDD\u8303\u56F4\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u786E\u8BA4\u65B0\u7684\u5220\u9664\u8303\u56F4\u3002",
  "update.section": "\u63D2\u4EF6\u66F4\u65B0",
  "update.intro": "\u68C0\u67E5\u5B98\u65B9\u53D1\u5E03\u6E20\u9053\uFF0C\u5E76\u5C31\u5730\u5B89\u88C5\u66F4\u65B0\u7684\u63D2\u4EF6\u7248\u672C\u3002\u4E0B\u8F7D\u4E0E\u5B89\u88C5\u7531\u5BBF\u4E3B\u63D2\u4EF6\u7BA1\u7406\u5668\u6267\u884C\uFF0C\u4E0D\u6539\u52A8\u672C\u673A\u5176\u4ED6\u5185\u5BB9\u3002",
  "update.current": "\u5DF2\u5B89\u88C5\u7248\u672C",
  "update.latest": "\u6700\u65B0\u7248\u672C",
  "update.runtime": "Harness \u8FD0\u884C\u65F6",
  "update.channel": "\u66F4\u65B0\u901A\u9053",
  "update.channelPackage": "\u53D1\u5E03\u5B89\u88C5\u5305",
  "update.channelCheckout": "Git \u68C0\u51FA",
  "update.check": "\u68C0\u67E5\u66F4\u65B0",
  "update.checking": "\u68C0\u67E5\u4E2D\u2026",
  "update.apply": "\u7ACB\u5373\u66F4\u65B0",
  "update.downloading": "\u6B63\u5728\u4E0B\u8F7D\u65B0\u7248\u672C\u2026",
  "update.installing": "\u6B63\u5728\u5B89\u88C5\u65B0\u7248\u672C\u2026",
  "update.rebuilding": "\u6B63\u5728\u66F4\u65B0\u68C0\u51FA\u5E76\u91CD\u65B0\u6784\u5EFA\u2026",
  "update.applied": "\u66F4\u65B0\u5DF2\u5B89\u88C5",
  "update.idle": "\u5C1A\u672A\u68C0\u67E5\u3002",
  "update.uptodate": "\u5F53\u524D\u5DF2\u662F\u6700\u65B0\u53D1\u5E03\u7248\u672C\u3002",
  "update.outdated": "\u53D1\u73B0\u66F4\u65B0\u7684\u53D1\u5E03\u7248\u672C\u3002",
  "update.restart": "\u8BF7\u5B8C\u5168\u9000\u51FA\u5E76\u91CD\u65B0\u6253\u5F00 Desktop\uFF08\u542B\u6258\u76D8\u5B9E\u4F8B\uFF09\uFF0C\u65B0\u7248\u672C\u624D\u4F1A\u751F\u6548\u3002",
  "update.unknown": "\u672A\u77E5",
  "update.unavailable": "\u5F53\u524D\u8FD0\u884C\u65F6\u6CA1\u6709\u53EF\u7528\u7684\u5BBF\u4E3B\u66F4\u65B0\u670D\u52A1\u3002",
  "update.pendingCommits": "\u5F85\u62C9\u53D6\u7684\u4E0A\u6E38\u63D0\u4EA4",
  "update.compatVerified": "\u5F53\u524D Harness \u7248\u672C\u5DF2\u5217\u5165\u672C\u6784\u5EFA\u7684\u5B9E\u6D4B\u7248\u672C\u5217\u8868\u3002",
  "update.compatNewer": "\u5F53\u524D Harness \u7248\u672C\u9AD8\u4E8E\u5DF2\u9A8C\u8BC1\u8303\u56F4\uFF1B\u63D2\u4EF6\u4ECD\u4F1A\u52A0\u8F7D\uFF0C\u53EA\u662F\u672A\u7ECF\u5B9E\u6D4B\u3002",
  "update.compatOlder": "\u5F53\u524D Harness \u7248\u672C\u672A\u5217\u5165\u5B9E\u6D4B\u7248\u672C\u5217\u8868\uFF0C\u90E8\u5206\u80FD\u529B\u53EF\u80FD\u4E0D\u53EF\u7528\u3002",
  "update.compatUnknown": "\u65E0\u6CD5\u8BFB\u53D6 Harness \u7248\u672C\uFF0C\u517C\u5BB9\u6027\u672A\u77E5\u3002",
  "update.blocked.busy": "\u5DF2\u6709\u66F4\u65B0\u6B63\u5728\u8FDB\u884C\u3002",
  "update.blocked.no-plugin-manager": "\u5F53\u524D\u8FD0\u884C\u65F6\u6CA1\u6709\u5BBF\u4E3B\u63D2\u4EF6\u7BA1\u7406\u5668\uFF0C\u65E0\u6CD5\u5728\u6B64\u5B89\u88C5\u63D2\u4EF6\u5305\u3002",
  "update.blocked.no-release": "\u53D1\u5E03\u6E20\u9053\u6CA1\u6709\u53EF\u7528\u7248\u672C\u3002",
  "update.blocked.no-asset": "\u8BE5\u53D1\u5E03\u7248\u672C\u6CA1\u6709\u53EF\u5B89\u88C5\u7684\u63D2\u4EF6\u5305\u3002",
  "update.blocked.checksum-mismatch": "\u4E0B\u8F7D\u5305\u672A\u901A\u8FC7 SHA-256 \u6821\u9A8C\uFF0C\u672A\u6267\u884C\u5B89\u88C5\u3002",
  "update.blocked.incompatible-version": "\u65B0\u7248\u672C\u62D2\u7EDD\u5F53\u524D Harness \u7248\u672C\uFF1B\u8BF7\u5148\u5347\u7EA7 Harness \u6216\u5B89\u88C5\u517C\u5BB9\u7248\u672C\u3002",
  "update.blocked.dirty-worktree": "\u68C0\u51FA\u76EE\u5F55\u6709\u672C\u5730\u6539\u52A8\uFF0C\u8BF7\u5148\u63D0\u4EA4\u6216\u6682\u5B58\u518D\u66F4\u65B0\u3002",
  "update.blocked.no-upstream": "\u5F53\u524D\u5206\u652F\u6CA1\u6709\u53EF\u66F4\u65B0\u7684\u4E0A\u6E38\u3002",
  "update.blocked.no-update": "\u672A\u53D1\u73B0\u66F4\u65B0\u7684\u7248\u672C\u3002",
  "update.blocked.checksum-missing": "\u8BE5\u53D1\u5E03\u7248\u672C\u7F3A\u5C11 SHA-256 \u6458\u8981\uFF0C\u5DF2\u963B\u6B62\u5B89\u88C5\u3002",
  "update.blocked.checksum-invalid": "\u6821\u9A8C\u6587\u4EF6\u4E2D\u6CA1\u6709\u6B64\u5B89\u88C5\u5305\u7684\u6709\u6548\u6458\u8981\u3002",
  "update.blocked.package-identity-mismatch": "\u5B89\u88C5\u5305\u540D\u79F0\u6216\u7248\u672C\u4E0E\u6240\u9009\u53D1\u5E03\u7248\u672C\u4E0D\u4E00\u81F4\u3002",
  "update.blocked.install-failed": "\u5BBF\u4E3B\u672A\u80FD\u5B89\u88C5\u66F4\u65B0\uFF0C\u8BF7\u67E5\u770B\u4E0B\u65B9\u539F\u56E0\u540E\u91CD\u8BD5\u3002",
  "update.blocked.install-cancelled": "\u5BBF\u4E3B\u5DF2\u53D6\u6D88\u5B89\u88C5\uFF0C\u672A\u786E\u8BA4\u66F4\u65B0\u6210\u529F\u3002",
  "update.blocked.install-overridden": "\u5B89\u88C5\u7ED3\u679C\u88AB\u5176\u4ED6\u914D\u7F6E\u5C42\u8986\u76D6\uFF0C\u5C1A\u672A\u542F\u7528\u3002",
  "update.blocked.checkout-changed": "\u51C6\u5907\u671F\u95F4\u68C0\u51FA\u76EE\u5F55\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u6838\u5BF9\u672C\u5730\u6539\u52A8\u540E\u91CD\u8BD5\u3002",
  "update.blocked.build-failed": "\u66F4\u65B0\u6784\u5EFA\u5931\u8D25\uFF0C\u8BF7\u5904\u7406\u4E0B\u65B9\u539F\u56E0\u540E\u91CD\u8BD5\u3002",
  "update.blocked.activation-failed": "\u5DF2\u51C6\u5907\u7684\u66F4\u65B0\u672A\u80FD\u66FF\u6362\u5DF2\u5B89\u88C5\u6587\u4EF6\uFF0C\u8BF7\u91CD\u8BD5\u5B8C\u6210\u3002",
  "update.resumePending": "\u5DF2\u4FDD\u7559\u672A\u5B8C\u6210\u7684\u68C0\u51FA\u66F4\u65B0\uFF0C\u70B9\u51FB\u201C\u7ACB\u5373\u66F4\u65B0\u201D\u53EF\u7EE7\u7EED\u5269\u4F59\u6B65\u9AA4\u3002",
  "update.pendingBuilds": "\u4EE5\u4E0B\u4F9D\u8D56\u6784\u5EFA\u811A\u672C\u9700\u8981\u5728\u5BBF\u4E3B\u63D2\u4EF6\u7BA1\u7406\u5668\u4E2D\u6279\u51C6\uFF1A",
  "update.warning": "\u5B89\u88C5\u63D0\u793A"
};

// src/module-config.ts
function conversationManagementEnabled(snapshot) {
  const value = snapshot.view?.namespaces.find((entry) => entry.ns === "ai-agent-engine")?.value;
  return typeof value === "object" && value !== null && !Array.isArray(value) && value.conversationManagement === true;
}

// src/team-presentation.tsx
var import_react = require("react");

// src/team-roles.ts
var roleKeys = {
  lead: "role.lead",
  requirements: "role.requirements",
  frontend: "role.frontend",
  backend: "role.backend",
  "unit-test": "role.unit-test",
  "integration-test": "role.integration-test",
  "browser-test": "role.browser-test",
  "e2e-engineer": "role.e2e-engineer"
};
function roleLabel(name, translate) {
  for (const [role, key] of Object.entries(roleKeys)) {
    if (name === role) return translate(key);
    const suffix = name.slice(role.length);
    if (name.startsWith(role) && /^-[1-9]\d*$/.test(suffix)) {
      return "".concat(translate(key), " ").concat(suffix.slice(1));
    }
  }
  return name;
}
function createRolePresentation(translate) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (team) => {
    const cached2 = cache.get(team);
    if (cached2) return cached2;
    const result2 = {
      ...team,
      members: team.members.map((member) => ({ ...member, name: roleLabel(member.name, translate) })),
      tasks: team.tasks.map((task) => task.ownerName === void 0 ? task : { ...task, ownerName: roleLabel(task.ownerName, translate) })
    };
    cache.set(team, result2);
    return result2;
  };
}

// src/team-presentation.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var slot = "conversation.session.header.actions";
function installTeamPresentation(ctx) {
  ctx.slots.inject(slot, () => {
    let source;
    let dispose;
    let reconciling = false;
    const reconcile = () => {
      if (reconciling) return;
      reconciling = true;
      try {
        let RolePanel2 = function(props) {
          const translate = ctx.locale.bind("ai-agent-engine");
          const revision = ctx.locale.getSnapshot().revision;
          const present = (0, import_react.useMemo)(() => {
            const teamView = createRolePresentation(translate);
            const snapshots = /* @__PURE__ */ new WeakMap();
            return (snapshot) => {
              const cached2 = snapshots.get(snapshot);
              if (cached2) return cached2;
              const result2 = {
                ...snapshot,
                projectionsBySession: Object.fromEntries(Object.entries(snapshot.projectionsBySession).map(([id, projection]) => {
                  const team = projection.values.agentTeam;
                  return [id, team === void 0 ? projection : {
                    ...projection,
                    values: { ...projection.values, agentTeam: teamView(team) }
                  }];
                }))
              };
              snapshots.set(snapshot, result2);
              return result2;
            };
          }, [revision]);
          const useSessions = (selector, equal) => props.useSessions((snapshot) => selector(present(snapshot)), equal);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialPanel, { ...props, useSessions });
        };
        var RolePanel = RolePanel2;
        const entry = ctx.slots.entries(slot).find((candidate) => candidate.options.id === "agent-team" && candidate.registrant !== "ai-agent-engine-roles");
        if (entry === source) return;
        dispose?.();
        dispose = void 0;
        source = entry;
        if (!entry) return;
        const OfficialPanel = entry.component;
        const register = ctx.slots.register;
        dispose = register.call(ctx.slots, {
          name: slot,
          id: "agent-team",
          order: entry.options.order,
          priority: (entry.options.priority ?? 0) - 1,
          registrant: "ai-agent-engine-roles",
          locale: entry.locale,
          inject: entry.inject
        }, RolePanel2);
      } finally {
        reconciling = false;
      }
    };
    const unsubscribe = ctx.slots.subscribe(slot, reconcile);
    reconcile();
    return () => {
      unsubscribe();
      dispose?.();
    };
  });
}

// node_modules/zod/v4/core/core.js
var _a;
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a3;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");
var $ZodAsyncError = class extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
};
var $ZodEncodeError = class extends Error {
  constructor(name) {
    super("Encountered unidirectional transform during encode: ".concat(name));
    this.name = "ZodEncodeError";
  }
};
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}

// node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  explicitlyAborted: () => explicitlyAborted,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = void 0;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
  if (!path)
    return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(data) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";
    default:
      throw new Error("Unknown data type: ".concat(t));
  }
};
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var primitiveTypes = /* @__PURE__ */ new Set([
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined"
]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return '"'.concat(value, '"');
  return "".concat(value);
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error('Unrecognized key: "'.concat(key, '"'));
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error('Unrecognized key: "'.concat(key, '"'));
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error('Unrecognized key: "'.concat(key, '"'));
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error('Unrecognized key: "'.concat(key, '"'));
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a3;
    (_a3 = iss).path ?? (_a3.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base642) {
  const binaryString = atob(base642);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url2) {
  const base642 = base64url2.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base642.length % 4) % 4);
  return base64ToUint8Array(base642 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
  const cleanHex = hex.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var Class = class {
  constructor(..._args) {
  }
};

// node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error2, path = []) => {
    for (const issue2 of error2.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }, [...path, ...issue2.path]));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues }, [...path, ...issue2.path]);
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues }, [...path, ...issue2.path]);
      } else {
        const fullpath = [...path, ...issue2.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue2));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue2));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result2 = schema._zod.run({ value, issues: [] }, ctx);
  if (result2 instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (result2.issues.length) {
    const e = new (_params?.Err ?? _Err)(result2.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result2.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result2 = schema._zod.run({ value, issues: [] }, ctx);
  if (result2 instanceof Promise)
    result2 = await result2;
  if (result2.issues.length) {
    const e = new (params?.Err ?? _Err)(result2.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result2.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result2 = schema._zod.run({ value, issues: [] }, ctx);
  if (result2 instanceof Promise) {
    throw new $ZodAsyncError();
  }
  return result2.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result2.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result2.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result2 = schema._zod.run({ value, issues: [] }, ctx);
  if (result2 instanceof Promise)
    result2 = await result2;
  return result2.issues.length ? {
    success: false,
    error: new _Err(result2.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result2.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};

// node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version2) => {
  if (!version2)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp("^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-".concat(version2, "[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$"));
};
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
var date = /* @__PURE__ */ new RegExp("^".concat(dateSource, "$"));
function timeSource(args) {
  const hhmm = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  const regex = typeof args.precision === "number" ? args.precision === -1 ? "".concat(hhmm) : args.precision === 0 ? "".concat(hhmm, ":[0-5]\\d") : "".concat(hhmm, ":[0-5]\\d\\.\\d{").concat(args.precision, "}") : "".concat(hhmm, "(?::[0-5]\\d(?:\\.\\d+)?)?");
  return regex;
}
function time(args) {
  return new RegExp("^".concat(timeSource(args), "$"));
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const timeRegex = "".concat(time3, "(?:").concat(opts.join("|"), ")");
  return new RegExp("^".concat(dateSource, "T(?:").concat(timeRegex, ")$"));
}
var string = (params) => {
  const regex = params ? "[\\s\\S]{".concat(params?.minimum ?? 0, ",").concat(params?.maximum ?? "", "}") : "[\\s\\S]*";
  return new RegExp("^".concat(regex, "$"));
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a3;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a3 = inst._zod).onattach ?? (_a3.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    var _a3;
    (_a3 = inst2._zod.bag).multipleOf ?? (_a3.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a3;
  $ZodCheck.init(inst, def);
  (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a3;
  $ZodCheck.init(inst, def);
  (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a3;
  $ZodCheck.init(inst, def);
  (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a3, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a3 = inst._zod).check ?? (_a3.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {
    });
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? "^.{".concat(def.position, "}").concat(escapedRegex) : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp("^".concat(escapeRegex(def.prefix), ".*"));
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(".*".concat(escapeRegex(def.suffix), "$"));
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// node_modules/zod/v4/core/doc.js
var Doc = class {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split("\n").filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [""];
    const lines = [...content.map((x) => "  ".concat(x))];
    return new F(...args, lines.join("\n"));
  }
};

// node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 4,
  patch: 3
};

// node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a3;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result2 = inst._zod.parse(payload, ctx);
      if (result2 instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return result2.then((result3) => runChecks(result3, checks, ctx));
      }
      return runChecks(result2, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {
      }
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === void 0)
      throw new Error('Invalid UUID version: "'.concat(def.version, '"'));
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      if (!def.normalize && def.protocol?.source === httpProtocol.source) {
        if (!/^https?:\/\//i.test(trimmed)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid URL format",
            input: payload.value,
            inst,
            continue: !def.abort
          });
          return;
        }
      }
      const url = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = "ipv4";
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = "ipv6";
  inst._zod.check = (payload) => {
    try {
      new URL("http://[".concat(payload.value, "]"));
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error();
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error();
      const prefixNum = Number(prefix);
      if ("".concat(prefixNum) !== prefix)
        throw new Error();
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error();
      new URL("http://[".concat(address, "]"));
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base642 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base642.padEnd(Math.ceil(base642.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result2, final, index) {
  if (result2.issues.length) {
    final.issues.push(...prefixIssues(index, result2.issues));
  }
  final.value[index] = result2.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result2 = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result2 instanceof Promise) {
        proms.push(result2.then((result3) => handleArrayResult(result3, payload, i)));
      } else {
        handleArrayResult(result2, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result2, final, key, input, isOptionalIn, isOptionalOut) {
  const isPresent = key in input;
  if (result2.issues.length) {
    if (isOptionalIn && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result2.issues));
  }
  if (!isPresent && !isOptionalIn) {
    if (!result2.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [key]
      });
    }
    return;
  }
  if (result2.value === void 0) {
    if (isPresent) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result2.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error('Invalid element at key "'.concat(k, '": expected a Zod schema'));
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalIn = _catchall.optin === "optional";
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (key === "__proto__")
      continue;
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalIn = el._zod.optin === "optional";
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return "shape[".concat(k, "]._zod.run({ value: input[").concat(k, "], issues: [] }, ctx)");
    };
    doc.write("const input = payload.value;");
    const ids = /* @__PURE__ */ Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = "key_".concat(counter++);
    }
    doc.write("const newResult = {};");
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalIn = schema?._zod?.optin === "optional";
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write("const ".concat(id, " = ").concat(parseStr(key), ";"));
      if (isOptionalIn && isOptionalOut) {
        doc.write("\n        if (".concat(id, ".issues.length) {\n          if (").concat(k, " in input) {\n            payload.issues = payload.issues.concat(").concat(id, ".issues.map(iss => ({\n              ...iss,\n              path: iss.path ? [").concat(k, ", ...iss.path] : [").concat(k, "]\n            })));\n          }\n        }\n        \n        if (").concat(id, ".value === undefined) {\n          if (").concat(k, " in input) {\n            newResult[").concat(k, "] = undefined;\n          }\n        } else {\n          newResult[").concat(k, "] = ").concat(id, ".value;\n        }\n        \n      "));
      } else if (!isOptionalIn) {
        doc.write("\n        const ".concat(id, "_present = ").concat(k, " in input;\n        if (").concat(id, ".issues.length) {\n          payload.issues = payload.issues.concat(").concat(id, ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [").concat(k, ", ...iss.path] : [").concat(k, "]\n          })));\n        }\n        if (!").concat(id, "_present && !").concat(id, '.issues.length) {\n          payload.issues.push({\n            code: "invalid_type",\n            expected: "nonoptional",\n            input: undefined,\n            path: [').concat(k, "]\n          });\n        }\n\n        if (").concat(id, "_present) {\n          if (").concat(id, ".value === undefined) {\n            newResult[").concat(k, "] = undefined;\n          } else {\n            newResult[").concat(k, "] = ").concat(id, ".value;\n          }\n        }\n\n      "));
      } else {
        doc.write("\n        if (".concat(id, ".issues.length) {\n          payload.issues = payload.issues.concat(").concat(id, ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [").concat(k, ", ...iss.path] : [").concat(k, "]\n          })));\n        }\n        \n        if (").concat(id, ".value === undefined) {\n          if (").concat(k, " in input) {\n            newResult[").concat(k, "] = undefined;\n          }\n        } else {\n          newResult[").concat(k, "] = ").concat(id, ".value;\n        }\n        \n      "));
      }
    }
    doc.write("payload.value = newResult;");
    doc.write("return payload;");
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result2 of results) {
    if (result2.issues.length === 0) {
      final.value = result2.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result2) => result2.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp("^(".concat(patterns.map((p) => cleanRegex(p.source)).join("|"), ")$"));
    }
    return void 0;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result2 = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result2 instanceof Promise) {
        results.push(result2);
        async = true;
      } else {
        if (result2.issues.length === 0)
          return result2;
        results.push(result2);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result2, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result2.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result2.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result2.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result2))
    return result2;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error("Unmergable intersection. Error path: " + "".concat(JSON.stringify(merged.mergeErrorPath)));
  }
  result2.value = merged.data;
  return result2;
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp("^(".concat(values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|"), ")$"));
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp("^(".concat(def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|"), ")$"));
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        payload.fallback = true;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError();
    }
    payload.value = _out;
    payload.fallback = true;
    return payload;
  };
});
function handleOptionalResult(result2, input) {
  if (input === void 0 && (result2.issues.length || result2.fallback)) {
    return { issues: [], value: void 0 };
  }
  return result2;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp("^(".concat(cleanRegex(pattern.source), ")?$")) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const input = payload.value;
      const result2 = def.innerType._zod.run(payload, ctx);
      if (result2 instanceof Promise)
        return result2.then((r) => handleOptionalResult(r, input));
      return handleOptionalResult(result2, input);
    }
    if (payload.value === void 0) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp("^(".concat(cleanRegex(pattern.source), "|null)$")) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result2 = def.innerType._zod.run(payload, ctx);
    if (result2 instanceof Promise) {
      return result2.then((result3) => handleDefaultResult(result3, def));
    }
    return handleDefaultResult(result2, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result2 = def.innerType._zod.run(payload, ctx);
    if (result2 instanceof Promise) {
      return result2.then((result3) => handleNonOptionalResult(result3, inst));
    }
    return handleNonOptionalResult(result2, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result2 = def.innerType._zod.run(payload, ctx);
    if (result2 instanceof Promise) {
      return result2.then((result3) => {
        payload.value = result3.value;
        if (result3.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result3.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      });
    }
    payload.value = result2.value;
    if (result2.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
      payload.fallback = true;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result2 = def.innerType._zod.run(payload, ctx);
    if (result2 instanceof Promise) {
      return result2.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result2);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result2, payload, input, inst) {
  if (!result2) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}

// node_modules/zod/v4/core/registries.js
var _a2;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");
var $ZodRegistry = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta2 = _meta[0];
    this._map.set(schema, meta2);
    if (meta2 && typeof meta2 === "object" && "id" in meta2) {
      this._idmap.set(meta2.id, schema);
    }
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta2 = this._map.get(schema);
    if (meta2 && typeof meta2 === "object" && "id" in meta2) {
      this._idmap.delete(meta2.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
};
function registry() {
  return new $ZodRegistry();
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;

// node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
  return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
  return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
  return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}

// node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a3;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result2 = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result2);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result2.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result2.schema, params);
    } else {
      const _json = result2.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error("[toJSONSchema]: Non-representable type encountered: ".concat(def.type));
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result2.ref)
        result2.ref = parent;
      process(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta2 = ctx.metadataRegistry.get(schema);
  if (meta2)
    Object.assign(result2.schema, meta2);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result2.schema.examples;
    delete result2.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result2.schema)
    (_a3 = result2.schema).default ?? (_a3.default = result2.schema._prefault);
  delete result2.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error('Duplicate schema id "'.concat(id, '" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.'));
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? "schema".concat(ctx.counter++);
      entry[1].defId = id;
      return { defId: id, ref: "".concat(uriGenerator("__shared"), "#/").concat(defsSegment, "/").concat(id) };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = "#";
    const defUriPrefix = "".concat(uriPrefix, "/").concat(defsSegment, "/");
    const defId = entry[1].schema.id ?? "__schema".concat(ctx.counter++);
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + "#/".concat(seen.cycle?.join("/"), "/<root>") + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
      }
      Object.assign(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result2 = {};
  if (ctx.target === "draft-2020-12") {
    result2.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result2.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result2.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
  } else {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result2.$id = ctx.external.uri(id);
  }
  Object.assign(result2, root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== void 0 && result2.id === rootMetaId)
    delete result2.id;
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      if (seen.def.id === seen.defId)
        delete seen.def.id;
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result2.$defs = defs;
      } else {
        result2.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result2));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};

// node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (typeof multipleOf === "number")
    json.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {
};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var literalProcessor = (schema, ctx, json, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === void 0) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else {
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {
  } else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  json.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json.properties[key] = process(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === void 0;
    } else {
      return v.optout === void 0;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  process(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};

// node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
      // enumerable: false,
    },
    addIssue: {
      value: (issue2) => {
        inst.issues.push(issue2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (issues2) => {
        inst.issues.push(...issues2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
      // enumerable: false,
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
  Parent: Error
});

// node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// node_modules/zod/v4/classic/schemas.js
var _installedGroups = /* @__PURE__ */ new WeakMap();
function _installLazyMethods(inst, group, methods) {
  const proto = Object.getPrototypeOf(inst);
  let installed = _installedGroups.get(proto);
  if (!installed) {
    installed = /* @__PURE__ */ new Set();
    _installedGroups.set(proto, installed);
  }
  if (installed.has(group))
    return;
  installed.add(group);
  for (const key in methods) {
    const fn = methods[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      enumerable: false,
      get() {
        const bound = fn.bind(this);
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: bound
        });
        return bound;
      },
      set(v) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v
        });
      }
    });
  }
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse2(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  _installLazyMethods(inst, "ZodType", {
    check(...chks) {
      const def2 = this.def;
      return this.clone(util_exports.mergeDefs(def2, {
        checks: [
          ...def2.checks ?? [],
          ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }), { parent: true });
    },
    with(...chks) {
      return this.check(...chks);
    },
    clone(def2, params) {
      return clone(this, def2, params);
    },
    brand() {
      return this;
    },
    register(reg, meta2) {
      reg.add(this, meta2);
      return this;
    },
    refine(check, params) {
      return this.check(refine(check, params));
    },
    superRefine(refinement, params) {
      return this.check(superRefine(refinement, params));
    },
    overwrite(fn) {
      return this.check(_overwrite(fn));
    },
    optional() {
      return optional(this);
    },
    exactOptional() {
      return exactOptional(this);
    },
    nullable() {
      return nullable(this);
    },
    nullish() {
      return optional(nullable(this));
    },
    nonoptional(params) {
      return nonoptional(this, params);
    },
    array() {
      return array(this);
    },
    or(arg) {
      return union([this, arg]);
    },
    and(arg) {
      return intersection(this, arg);
    },
    transform(tx) {
      return pipe(this, transform(tx));
    },
    default(d) {
      return _default(this, d);
    },
    prefault(d) {
      return prefault(this, d);
    },
    catch(params) {
      return _catch(this, params);
    },
    pipe(target) {
      return pipe(this, target);
    },
    readonly() {
      return readonly(this);
    },
    describe(description) {
      const cl = this.clone();
      globalRegistry.add(cl, { description });
      return cl;
    },
    meta(...args) {
      if (args.length === 0)
        return globalRegistry.get(this);
      const cl = this.clone();
      globalRegistry.add(cl, args[0]);
      return cl;
    },
    isOptional() {
      return this.safeParse(void 0).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(fn) {
      return fn(this);
    }
  });
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  _installLazyMethods(inst, "_ZodString", {
    regex(...args) {
      return this.check(_regex(...args));
    },
    includes(...args) {
      return this.check(_includes(...args));
    },
    startsWith(...args) {
      return this.check(_startsWith(...args));
    },
    endsWith(...args) {
      return this.check(_endsWith(...args));
    },
    min(...args) {
      return this.check(_minLength(...args));
    },
    max(...args) {
      return this.check(_maxLength(...args));
    },
    length(...args) {
      return this.check(_length(...args));
    },
    nonempty(...args) {
      return this.check(_minLength(1, ...args));
    },
    lowercase(params) {
      return this.check(_lowercase(params));
    },
    uppercase(params) {
      return this.check(_uppercase(params));
    },
    trim() {
      return this.check(_trim());
    },
    normalize(...args) {
      return this.check(_normalize(...args));
    },
    toLowerCase() {
      return this.check(_toLowerCase());
    },
    toUpperCase() {
      return this.check(_toUpperCase());
    },
    slugify() {
      return this.check(_slugify());
    }
  });
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  _installLazyMethods(inst, "ZodNumber", {
    gt(value, params) {
      return this.check(_gt(value, params));
    },
    gte(value, params) {
      return this.check(_gte(value, params));
    },
    min(value, params) {
      return this.check(_gte(value, params));
    },
    lt(value, params) {
      return this.check(_lt(value, params));
    },
    lte(value, params) {
      return this.check(_lte(value, params));
    },
    max(value, params) {
      return this.check(_lte(value, params));
    },
    int(params) {
      return this.check(int(params));
    },
    safe(params) {
      return this.check(int(params));
    },
    positive(params) {
      return this.check(_gt(0, params));
    },
    nonnegative(params) {
      return this.check(_gte(0, params));
    },
    negative(params) {
      return this.check(_lt(0, params));
    },
    nonpositive(params) {
      return this.check(_lte(0, params));
    },
    multipleOf(value, params) {
      return this.check(_multipleOf(value, params));
    },
    step(value, params) {
      return this.check(_multipleOf(value, params));
    },
    finite() {
      return this;
    }
  });
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  _installLazyMethods(inst, "ZodArray", {
    min(n, params) {
      return this.check(_minLength(n, params));
    },
    nonempty(params) {
      return this.check(_minLength(1, params));
    },
    max(n, params) {
      return this.check(_maxLength(n, params));
    },
    length(n, params) {
      return this.check(_length(n, params));
    },
    unwrap() {
      return this.element;
    }
  });
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  util_exports.defineLazy(inst, "shape", () => {
    return def.shape;
  });
  _installLazyMethods(inst, "ZodObject", {
    keyof() {
      return _enum(Object.keys(this._zod.def.shape));
    },
    catchall(catchall) {
      return this.clone({ ...this._zod.def, catchall });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: never() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: void 0 });
    },
    extend(incoming) {
      return util_exports.extend(this, incoming);
    },
    safeExtend(incoming) {
      return util_exports.safeExtend(this, incoming);
    },
    merge(other) {
      return util_exports.merge(this, other);
    },
    pick(mask) {
      return util_exports.pick(this, mask);
    },
    omit(mask) {
      return util_exports.omit(this, mask);
    },
    partial(...args) {
      return util_exports.partial(ZodOptional, this, args[0]);
    },
    required(...args) {
      return util_exports.required(ZodNonOptional, this, args[0]);
    }
  });
});
function strictObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: never(),
    ...util_exports.normalizeParams(params)
  });
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error("Key ".concat(value, " not found in enum"));
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error("Key ".concat(value, " not found in enum"));
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util_exports.normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(util_exports.issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(util_exports.issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        payload.fallback = true;
        return payload;
      });
    }
    payload.value = output;
    payload.fallback = true;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}

// src/deletion-rpc.ts
var namespace = "aeConversations";
var identity = string2().min(1);
var previewRequest = strictObject({ sessionId: identity });
var preview = strictObject({
  sessionId: identity,
  sessionIds: array(identity).min(1),
  fingerprint: string2().regex(/^[a-f0-9]{64}$/),
  runningSessionIds: array(identity)
});
var confirmation = preview.extend({ stopRunning: literal(true) });
function codec(schema, name) {
  return { mode: "strict", typeSymbol: "ai-agent-engine-deepseek#".concat(name), create: () => schema };
}
var deletionRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: ["deletePreview", "delete"].map((method) => ({
    id: "ai-agent-engine-deepseek#".concat(namespace, "/").concat(method),
    service: "aeConversations",
    namespace,
    method,
    invocation: { kind: "direct" },
    parameters: [{
      name: "request",
      wire: "request",
      source: "json",
      codec: codec(method === "deletePreview" ? previewRequest : confirmation, "".concat(method, "Request"))
    }],
    result: codec(method === "deletePreview" ? preview : array(identity), "".concat(method, "Result"))
  }))
};

// src/roles-rpc.ts
var namespace2 = "aeRoles";
var roleId = string2().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).refine((id) => id !== "lead");
var overlayEntry = strictObject({
  id: roleId,
  skill: string2().min(1).optional(),
  responsibility: string2().optional()
});
var putRequest = strictObject({
  version: literal(1),
  roles: array(overlayEntry)
});
var roleDefinition = strictObject({
  id: string2().min(1),
  skill: string2().min(1).optional(),
  responsibility: string2().optional()
});
var catalogResult = strictObject({
  roles: array(roleDefinition),
  source: union([literal("builtin"), literal("merged")]),
  path: string2().optional(),
  enabled: boolean2()
});
var overlayResult = strictObject({
  version: literal(1),
  roles: array(overlayEntry),
  path: string2().optional(),
  exists: boolean2()
});
var putResult = strictObject({
  path: string2().min(1),
  roles: array(roleDefinition),
  source: union([literal("builtin"), literal("merged")])
});
var restoreResult = strictObject({
  restored: literal(true),
  path: string2().optional(),
  roles: array(roleDefinition)
});
function codec2(schema, name) {
  return { mode: "strict", typeSymbol: "ai-agent-engine-deepseek#".concat(name), create: () => schema };
}
var emptyRequest = strictObject({});
var rolesRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [
    {
      method: "getCatalog",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(emptyRequest, "getCatalogRequest") }],
      result: codec2(catalogResult, "getCatalogResult")
    },
    {
      method: "getOverlay",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(emptyRequest, "getOverlayRequest") }],
      result: codec2(overlayResult, "getOverlayResult")
    },
    {
      method: "putOverlay",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(putRequest, "putOverlayRequest") }],
      result: codec2(putResult, "putOverlayResult")
    },
    {
      method: "restoreDefaults",
      parameters: [{ name: "request", wire: "request", source: "json", codec: codec2(emptyRequest, "restoreDefaultsRequest") }],
      result: codec2(restoreResult, "restoreDefaultsResult")
    }
  ].map((method) => ({
    id: "ai-agent-engine-deepseek#".concat(namespace2, "/").concat(method.method),
    service: "aeRoles",
    namespace: namespace2,
    method: method.method,
    invocation: { kind: "direct" },
    parameters: method.parameters,
    result: method.result
  }))
};

// src/compatibility-rpc.ts
var status = strictObject({
  state: _enum(["waiting", "ready", "unavailable"]),
  reason: _enum(["services", "interface", "initialization", "storage"]).optional()
});
var compatibilityRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [{
    id: "ai-agent-engine-deepseek#aeCompatibility/getStatus",
    service: "aeCompatibility",
    namespace: "aeCompatibility",
    method: "getStatus",
    invocation: { kind: "direct" },
    parameters: [{
      name: "request",
      wire: "request",
      source: "json",
      codec: { mode: "strict", typeSymbol: "ai-agent-engine-deepseek#statusRequest", create: () => strictObject({}) }
    }],
    result: {
      mode: "strict",
      typeSymbol: "ai-agent-engine-deepseek#statusResult",
      create: () => strictObject({ engineering: status, roles: status, deletion: status, update: status })
    }
  }]
};

// src/update-rpc.ts
var namespace3 = "aeUpdate";
var release = strictObject({
  version: string2().min(1),
  tag: string2().min(1),
  notes: string2().optional(),
  pageUrl: string2().optional(),
  assetUrl: string2().optional(),
  assetName: string2().optional(),
  checksumUrl: string2().optional(),
  publishedAt: string2().optional()
});
var installResult = strictObject({
  changed: boolean2(),
  application: _enum(["applied", "restart-required", "overridden", "failed", "cancelled"]),
  error: strictObject({ code: string2(), diagnostic: string2().optional() }).optional(),
  packageResult: strictObject({
    exitCode: number2().int(),
    output: string2(),
    truncated: boolean2(),
    logPath: string2(),
    kind: string2().optional(),
    timedOut: boolean2().optional()
  }).optional(),
  warnings: array(string2()).optional(),
  pendingBuilds: array(string2()).optional()
});
var state = strictObject({
  pluginName: string2().min(1),
  currentVersion: string2().min(1),
  runtimeVersion: string2().optional(),
  verifiedThrough: string2().optional(),
  runtimeSupport: _enum(["verified", "untested-newer", "untested-older", "unknown"]),
  channel: _enum(["package", "checkout"]),
  installSpec: string2().optional(),
  latest: release.optional(),
  pendingCommits: number2().int().nonnegative().optional(),
  pendingCheckout: strictObject({
    target: string2(),
    stage: _enum(["install", "build", "merge", "activate"])
  }).optional(),
  installResult: installResult.optional(),
  outdated: boolean2(),
  canApply: boolean2(),
  blocked: _enum([
    "busy",
    "no-plugin-manager",
    "no-release",
    "no-asset",
    "checksum-mismatch",
    "incompatible-version",
    "dirty-worktree",
    "no-upstream",
    "no-update",
    "checksum-missing",
    "checksum-invalid",
    "package-identity-mismatch",
    "install-failed",
    "install-cancelled",
    "install-overridden",
    "checkout-changed",
    "build-failed",
    "activation-failed"
  ]).optional(),
  phase: _enum(["idle", "checking", "downloading", "installing", "rebuilding", "applied", "failed"]),
  message: string2().optional(),
  error: string2().optional(),
  restartRequired: boolean2(),
  checkedAt: number2().optional()
});
var emptyRequest2 = strictObject({});
function codec3(schema, name) {
  return { mode: "strict", typeSymbol: "ai-agent-engine-deepseek#".concat(name), create: () => schema };
}
var result = codec3(state, "updateState");
var updateRpc = {
  package: "ai-agent-engine-deepseek",
  descriptors: [
    { method: "getState", name: "getStateRequest" },
    { method: "check", name: "checkUpdateRequest" },
    { method: "apply", name: "applyUpdateRequest" }
  ].map((method) => ({
    id: "ai-agent-engine-deepseek#".concat(namespace3, "/").concat(method.method),
    service: "aeUpdate",
    namespace: namespace3,
    method: method.method,
    invocation: { kind: "direct" },
    parameters: [{ name: "request", wire: "request", source: "json", codec: codec3(emptyRequest2, method.name) }],
    result: { ...result, typeSymbol: "ai-agent-engine-deepseek#".concat(method.method, "Result") }
  }))
};

// src/rpc.ts
var pluginRpc = {
  package: deletionRpc.package,
  descriptors: [
    ...deletionRpc.descriptors,
    ...rolesRpc.descriptors,
    ...compatibilityRpc.descriptors,
    ...updateRpc.descriptors
  ]
};

// src/roles-settings.tsx
var import_react2 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/role-catalog.ts
var BUILTIN_ROLES = [
  { id: "requirements", skill: "ae-grill", responsibility: "Resolve decisions that materially affect acceptance." },
  { id: "frontend", skill: "ae-frontend", responsibility: "Implement accessible UI and all relevant interaction states." },
  { id: "backend", skill: "ae-backend", responsibility: "Implement compatible services, authorization and persistence." },
  { id: "unit-test", skill: "ae-unit-test", responsibility: "Exercise meaningful isolated behavior and regressions." },
  { id: "integration-test", skill: "ae-integration-test", responsibility: "Verify real cross-module contracts in isolation." },
  { id: "browser-test", skill: "ae-e2e-test", responsibility: "Verify requested user journeys with browser evidence." },
  { id: "e2e-engineer", skill: "ae-e2e-suite", responsibility: "Maintain suite infrastructure and CI when requested." }
];
var ROLE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
var RESERVED = /* @__PURE__ */ new Set(["lead"]);
function isValidRoleId(id) {
  return typeof id === "string" && ROLE_ID.test(id) && !RESERVED.has(id);
}
function mergeRoleCatalog(builtin, overlay) {
  const byId = /* @__PURE__ */ new Map();
  const order = [];
  for (const role of builtin) {
    byId.set(role.id, { ...role });
    order.push(role.id);
  }
  for (const entry of overlay) {
    const current = byId.get(entry.id);
    if (current) {
      byId.set(entry.id, {
        id: current.id,
        skill: entry.skill !== void 0 ? entry.skill : current.skill,
        responsibility: entry.responsibility !== void 0 ? entry.responsibility : current.responsibility
      });
      continue;
    }
    byId.set(entry.id, {
      id: entry.id,
      skill: entry.skill,
      responsibility: entry.responsibility ?? ""
    });
    order.push(entry.id);
  }
  return order.map((id) => ({ ...byId.get(id) }));
}
function diffRolesAgainstBuiltin(edited, builtin = BUILTIN_ROLES) {
  const builtinById = new Map(builtin.map((role) => [role.id, role]));
  const overlay = [];
  for (const role of edited) {
    if (!isValidRoleId(role.id)) continue;
    const base = builtinById.get(role.id);
    if (!base) {
      overlay.push({
        id: role.id,
        skill: role.skill,
        responsibility: role.responsibility ?? ""
      });
      continue;
    }
    const entry = { id: role.id };
    let dirty = false;
    if (role.skill !== void 0 && role.skill !== base.skill) {
      Object.assign(entry, { skill: role.skill });
      dirty = true;
    }
    if (role.responsibility !== void 0 && role.responsibility !== base.responsibility) {
      Object.assign(entry, { responsibility: role.responsibility });
      dirty = true;
    }
    if (dirty) overlay.push(entry);
  }
  return overlay;
}

// src/roles-settings.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function toDraft(roles) {
  const builtinIds = new Set(BUILTIN_ROLES.map((role) => role.id));
  return roles.map((role) => ({
    id: role.id,
    skill: role.skill ?? "",
    responsibility: role.responsibility ?? "",
    custom: !builtinIds.has(role.id)
  }));
}
function draftToDefinitions(draft) {
  return draft.map((role) => ({
    id: role.id.trim(),
    skill: role.skill.trim() || void 0,
    responsibility: role.responsibility
  }));
}
async function unwrap(call) {
  const result2 = await call;
  if (result2 && typeof result2 === "object" && "ok" in result2) {
    const wrapped = result2;
    if (!wrapped.ok) throw wrapped.error;
    return wrapped.value;
  }
  return result2;
}
function RolesSettingsPage({ roles, t }) {
  const [draft, setDraft] = (0, import_react2.useState)([]);
  const [path, setPath] = (0, import_react2.useState)();
  const [source, setSource] = (0, import_react2.useState)("builtin");
  const [enabled, setEnabled] = (0, import_react2.useState)(true);
  const [status2, setStatus] = (0, import_react2.useState)("loading");
  const [message, setMessage] = (0, import_react2.useState)("");
  const [newId, setNewId] = (0, import_react2.useState)("");
  const [loaded, setLoaded] = (0, import_react2.useState)(false);
  const generation = (0, import_react2.useRef)(0);
  const pending = (0, import_react2.useRef)(false);
  const load = (0, import_react2.useCallback)(async () => {
    const current = ++generation.current;
    pending.current = true;
    setLoaded(false);
    setStatus("loading");
    setMessage("");
    try {
      const [catalog, overlay] = await Promise.all([
        unwrap(roles.getCatalog({})),
        unwrap(roles.getOverlay({}))
      ]);
      if (current !== generation.current) return;
      setDraft(toDraft(mergeRoleCatalog(BUILTIN_ROLES, overlay.roles)));
      setPath(overlay.path ?? catalog.path);
      setSource(overlay.exists ? "merged" : "builtin");
      setEnabled(catalog.enabled);
      setLoaded(true);
      setStatus("ready");
    } catch (error) {
      if (current !== generation.current) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("roles.loadFailed"));
    } finally {
      if (current === generation.current) pending.current = false;
    }
  }, [roles, t]);
  (0, import_react2.useEffect)(() => {
    void load();
    return () => {
      generation.current++;
      pending.current = false;
    };
  }, [load]);
  const editable = loaded && status2 !== "loading" && status2 !== "saving";
  const updateRow = (index, patch) => {
    if (!loaded || pending.current) return;
    setDraft((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  };
  const removeCustom = (index) => {
    if (!loaded || pending.current) return;
    setDraft((current) => current.filter((row, i) => i !== index || !row.custom));
  };
  const addCustom = () => {
    if (!loaded || pending.current) return;
    const id = newId.trim();
    if (!isValidRoleId(id) || draft.some((row) => row.id === id)) {
      setMessage(t("roles.invalidId"));
      return;
    }
    setDraft((current) => [...current, { id, skill: "", responsibility: "", custom: true }]);
    setNewId("");
    setMessage("");
  };
  const save = async () => {
    if (!loaded || pending.current) return;
    pending.current = true;
    const current = ++generation.current;
    setStatus("saving");
    setMessage("");
    try {
      const definitions = draftToDefinitions(draft);
      for (const role of definitions) {
        if (!isValidRoleId(role.id)) throw new Error(t("roles.invalidId"));
      }
      const overlay = diffRolesAgainstBuiltin(definitions);
      const result2 = await unwrap(roles.putOverlay({ version: 1, roles: overlay }));
      if (current !== generation.current) return;
      setDraft(toDraft(result2.roles));
      setPath(result2.path);
      setSource(result2.source);
      setStatus("ready");
      setMessage(t("roles.saved"));
    } catch (error) {
      if (current !== generation.current) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("roles.saveFailed"));
    } finally {
      if (current === generation.current) pending.current = false;
    }
  };
  const restore = async () => {
    if (!loaded || pending.current) return;
    pending.current = true;
    const current = ++generation.current;
    setStatus("saving");
    setMessage("");
    try {
      const result2 = await unwrap(roles.restoreDefaults({}));
      if (current !== generation.current) return;
      setDraft(toDraft(result2.roles.length ? result2.roles : mergeRoleCatalog(BUILTIN_ROLES, [])));
      setPath(result2.path);
      setSource("builtin");
      setStatus("ready");
      setMessage(t("roles.restored"));
    } catch (error) {
      if (current !== generation.current) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("roles.saveFailed"));
    } finally {
      if (current === generation.current) pending.current = false;
    }
  };
  if (status2 === "loading" && draft.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { role: "status", children: t("roles.loading") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { "data-ae-roles-settings": true, style: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: t("roles.intro") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { style: { opacity: 0.8, fontSize: 12 }, children: [
      t("roles.pathLabel"),
      ": ",
      path ?? t("roles.pathUnavailable"),
      " \xB7 ",
      t("roles.sourceLabel"),
      ": ",
      source,
      !enabled ? " \xB7 ".concat(t("roles.disabledHint")) : ""
    ] }),
    draft.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { "data-ae-role-row": row.id, style: { display: "grid", gap: 6, padding: 8, border: "1px solid rgba(127,127,127,0.35)", borderRadius: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("strong", { children: [
          row.id,
          row.custom ? " (".concat(t("roles.custom"), ")") : ""
        ] }),
        row.custom && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: !editable, onClick: () => removeCustom(index), children: t("roles.remove") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { style: { display: "grid", gap: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("roles.skill") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Input, { disabled: !editable, value: row.skill, onChange: (event) => updateRow(index, { skill: event.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { style: { display: "grid", gap: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("roles.responsibility") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Input, { disabled: !editable, value: row.responsibility, onChange: (event) => updateRow(index, { responsibility: event.target.value }) })
      ] })
    ] }, row.id)),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Input, { disabled: !editable, value: newId, placeholder: t("roles.newIdPlaceholder"), onChange: (event) => setNewId(event.target.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: !editable, onClick: addCustom, children: t("roles.add") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Button, { disabled: !editable, onClick: () => {
        void save();
      }, children: status2 === "saving" ? t("roles.saving") : t("roles.save") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: !editable, onClick: () => {
        void restore();
      }, children: t("roles.restore") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: status2 === "saving" || status2 === "loading", onClick: () => {
        void load();
      }, children: t("roles.reload") })
    ] }),
    message && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { role: status2 === "error" ? "alert" : "status", children: message })
  ] });
}

// src/row-context-menu.ts
function attachRowContextMenu(marker, sessionId) {
  const row = marker.closest("[data-row-key]");
  const slot2 = marker.closest('[data-slot="sidebar.workspaces.session.row.action"]');
  const actions = slot2?.parentElement ?? marker.parentElement;
  if (!row || !actions) return () => {
  };
  const nativeMenu = [...row.querySelectorAll("button[data-context-menu-trigger]")].some((button) => !slot2?.contains(button));
  if (nativeMenu) return () => {
  };
  const open = (event) => {
    const triggers = [...actions.querySelectorAll("button")].filter((button) => !slot2?.contains(button));
    if (triggers.length !== 1) return;
    event.preventDefault();
    event.stopPropagation();
    const alreadyOpen = [...marker.ownerDocument.querySelectorAll("[data-ae-delete-session]")].some((item) => item.getAttribute("data-ae-delete-session") === sessionId);
    if (!alreadyOpen) triggers[0].click();
  };
  row.addEventListener("contextmenu", open);
  return () => {
    row.removeEventListener("contextmenu", open);
  };
}

// src/module-runtime.ts
function initialModuleStatuses() {
  return {
    engineering: { state: "waiting", reason: "services" },
    roles: { state: "waiting", reason: "services" },
    deletion: { state: "waiting", reason: "services" },
    update: { state: "waiting", reason: "services" }
  };
}
var UnsupportedInterface = class extends Error {
};
function requireMethods(ctx, requirements) {
  for (const [service, methods] of Object.entries(requirements)) {
    let value;
    try {
      value = ctx[service];
    } catch {
      throw new UnsupportedInterface(service);
    }
    for (const method of methods) {
      if (typeof value?.[method] !== "function") throw new UnsupportedInterface("".concat(service, ".").concat(method));
    }
  }
}
function mountModule(ctx, id, services, requirements, statuses, setup) {
  ctx.inject(services, async (ready) => {
    ready.effect(() => () => {
      statuses[id] = { state: "waiting", reason: "services" };
    });
    const result2 = { completed: true };
    const scope = ready.plugin(async (child) => {
      requireMethods(child, requirements);
      result2.completed = await setup(child) !== false;
    });
    try {
      await scope;
      if (result2.completed) statuses[id] = { state: "ready" };
    } catch (error) {
      await scope.dispose();
      statuses[id] = statuses[id].reason === "storage" ? statuses[id] : {
        state: "unavailable",
        reason: error instanceof UnsupportedInterface ? "interface" : "initialization"
      };
      ready.logger.warn(
        "AI Agent Engine %s unavailable (%s): %s",
        id,
        statuses[id].reason,
        error instanceof Error ? error.message : "Unknown initialization error"
      );
    }
  });
}

// src/compatibility-settings.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function CompatibilitySettingsPage({ remote, clientStatuses, t }) {
  const [host, setHost] = (0, import_react3.useState)();
  const [client, setClient] = (0, import_react3.useState)(clientStatuses);
  (0, import_react3.useEffect)(() => {
    let active2 = true;
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const result2 = await remote?.getStatus({});
        if (active2) {
          setHost(result2?.ok ? result2.value : void 0);
          setClient(structuredClone(clientStatuses));
        }
      } catch {
        if (active2) setHost(void 0);
      } finally {
        pending = false;
      }
    };
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 2e3);
    return () => {
      active2 = false;
      clearInterval(timer);
    };
  }, [remote, clientStatuses]);
  const text = (status2) => {
    if (!status2) return t("compatibility.unreachable");
    if (status2.state === "ready") return t("compatibility.ready");
    return t("compatibility.".concat(status2.reason ?? status2.state));
  };
  const cell = {
    padding: "10px 12px",
    textAlign: "left",
    verticalAlign: "top",
    overflowWrap: "anywhere",
    borderBottom: "1px solid rgba(127,127,127,0.2)"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { "data-ae-compatibility": true, style: { maxWidth: 720 }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("table", { style: { width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("tr", { children: ["module", "host", "client"].map((label) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("th", { scope: "col", style: cell, children: t("compatibility.".concat(label)) }, label)) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("tbody", { children: ["engineering", "roles", "deletion", "update"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("tr", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("th", { scope: "row", style: cell, children: t("compatibility.".concat(id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("td", { style: cell, children: text(host?.[id]) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("td", { style: cell, children: text(client[id]) })
    ] }, id)) })
  ] }) });
}

// src/update-settings.tsx
var import_react4 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime4 = require("react/jsx-runtime");
async function unwrap2(call) {
  const result2 = await call;
  if (result2 && typeof result2 === "object" && "ok" in result2) {
    const wrapped = result2;
    if (!wrapped.ok) throw wrapped.error;
    return wrapped.value;
  }
  return result2;
}
var ACTIVE = ["checking", "downloading", "installing", "rebuilding"];
function active(state2) {
  return state2 !== void 0 && ACTIVE.includes(state2.phase);
}
function UpdateSettingsPage({ remote, t }) {
  const [state2, setState] = (0, import_react4.useState)();
  const [error, setError] = (0, import_react4.useState)("");
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const mounted = (0, import_react4.useRef)(true);
  (0, import_react4.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const load = (0, import_react4.useCallback)(async () => {
    if (remote === void 0) return;
    try {
      const next = await unwrap2(remote.getState({}));
      if (mounted.current) setState(next);
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, [remote]);
  const check = (0, import_react4.useCallback)(async () => {
    if (remote === void 0) return;
    setBusy(true);
    setError("");
    try {
      const next = await unwrap2(remote.check({}));
      if (mounted.current) setState(next);
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [remote]);
  const apply2 = (0, import_react4.useCallback)(async () => {
    if (remote === void 0) return;
    setBusy(true);
    setError("");
    try {
      const next = await unwrap2(remote.apply({}));
      if (mounted.current) setState(next);
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [remote]);
  (0, import_react4.useEffect)(() => {
    if (remote === void 0) return;
    void (async () => {
      try {
        const initial = await unwrap2(remote.getState({}));
        if (!mounted.current) return;
        setState(initial);
        if (initial.checkedAt === void 0) await check();
      } catch (failure) {
        if (mounted.current) setError(failure instanceof Error ? failure.message : String(failure));
      }
    })();
  }, [remote, check]);
  (0, import_react4.useEffect)(() => {
    if (!active(state2)) return;
    const timer = setInterval(() => {
      void load();
    }, 1500);
    return () => clearInterval(timer);
  }, [state2, load]);
  if (remote === void 0) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "status", children: t("update.unavailable") });
  const phase = state2?.phase ?? "idle";
  const running = active(state2);
  const compat = state2?.runtimeSupport ?? "unknown";
  const blocked = state2?.blocked;
  const pendingBuilds = state2?.installResult?.pendingBuilds ?? [];
  const compatKey = "update.compat".concat({ verified: "Verified", "untested-newer": "Newer", "untested-older": "Older", unknown: "Unknown" }[compat]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { "data-ae-update-settings": true, style: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { children: t("update.intro") }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("table", { style: { width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("tbody", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Row, { label: t("update.current"), value: state2?.currentVersion ?? t("update.unknown") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Row, { label: t("update.latest"), value: state2?.latest?.version ?? t("update.unknown") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Row, { label: t("update.channel"), value: state2 === void 0 ? t("update.unknown") : state2.channel === "checkout" ? t("update.channelCheckout") : t("update.channelPackage") }),
      state2?.runtimeVersion !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Row, { label: t("update.runtime"), value: "".concat(state2.runtimeVersion).concat(state2.verifiedThrough === void 0 ? "" : " \xB7 ".concat(state2.verifiedThrough)) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { opacity: 0.85, fontSize: 12 }, children: t(compatKey) }),
    state2?.pendingCommits !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { style: { fontSize: 12 }, children: [
      t("update.pendingCommits"),
      ": ",
      state2.pendingCommits
    ] }),
    state2?.latest?.notes !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.85 }, children: state2.latest.notes }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_dsh_client_ui_primitives2.Button, { variant: "outline", disabled: busy || running, onClick: () => {
        void check();
      }, children: phase === "checking" ? t("update.checking") : t("update.check") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_dsh_client_ui_primitives2.Button, { disabled: busy || running || state2?.canApply !== true, onClick: () => {
        void apply2();
      }, children: running ? t("update.".concat(phase)) : t("update.apply") })
    ] }),
    state2 !== void 0 && !running && phase !== "failed" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "status", children: phase === "applied" ? t("update.applied") : state2.outdated ? t("update.outdated") : blocked === "no-update" ? t("update.uptodate") : t("update.idle") }),
    running && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "status", children: t("update.".concat(phase)) }),
    state2?.restartRequired === true && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "alert", children: t("update.restart") }),
    state2?.pendingCheckout !== void 0 && !running && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "status", children: t("update.resumePending") }),
    pendingBuilds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { role: "alert", children: [
      t("update.pendingBuilds"),
      " ",
      pendingBuilds.join(", ")
    ] }),
    state2?.installResult?.warnings?.map((warning, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { role: "status", children: [
      t("update.warning"),
      ": ",
      warning
    ] }, index)),
    blocked !== void 0 && blocked !== "no-update" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "alert", children: t("update.blocked.".concat(blocked)) }),
    (error !== "" || state2?.error !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { role: "alert", children: error || state2?.error })
  ] });
}
function Row({ label, value }) {
  const cell = {
    padding: "8px 10px",
    textAlign: "left",
    verticalAlign: "top",
    overflowWrap: "anywhere",
    borderBottom: "1px solid rgba(127,127,127,0.2)"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("tr", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("th", { scope: "row", style: { ...cell, width: 160 }, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { style: cell, children: value })
  ] });
}

// src/client.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var inject = ["slots", "locale", "remote"];
function DeleteMenuItem({ sessionId, displayTitle, useMenuOpenState, useSettings, requestDeletion, t }) {
  const [, setOpen] = useMenuOpenState();
  const enabled = useSettings(conversationManagementEnabled);
  if (!enabled) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.MenuItemButton, { "data-ae-delete-session": sessionId, icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.IconTrashOutlineRegular, { size: 14 }), danger: true, separatorBefore: true, onSelect: () => {
    setOpen(false);
    void requestDeletion(sessionId, displayTitle);
  }, children: t("delete") });
}
function RowContextMenu({ sessionId, useSettings }) {
  const marker = (0, import_react5.useRef)(null);
  const enabled = useSettings(conversationManagementEnabled);
  (0, import_react5.useEffect)(() => {
    if (enabled && marker.current) return attachRowContextMenu(marker.current, sessionId);
  }, [enabled, sessionId]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { hidden: true, ref: marker, "data-ae-row-context": enabled ? "enabled" : "disabled" });
}
function DeletionDialog({ useDeletion, useSettings, confirm, close, requestDeletion, t }) {
  const state2 = useDeletion((value) => value);
  const enabled = useSettings(conversationManagementEnabled);
  if (state2 === null || !enabled) return null;
  const busy = state2.phase === "deleting";
  const ready = state2.preview !== void 0 && !state2.unavailable && !busy;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    import_dsh_client_ui_primitives3.Modal,
    {
      open: true,
      onClose: close,
      closeLabel: t("close"),
      title: t("title"),
      description: t("description"),
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.Button, { variant: "outline", disabled: busy, onClick: close, children: t("cancel") }),
        state2.phase === "error" && state2.preview === void 0 && !state2.unavailable ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.Button, { variant: "outline", onClick: () => {
          void requestDeletion(state2.sessionId, state2.displayTitle);
        }, children: t("retry") }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.Button, { variant: "outline", disabled: !ready, onClick: () => {
          void confirm();
        }, children: t("delete") })
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { children: [
          t("conversation"),
          ": ",
          state2.displayTitle || state2.sessionId
        ] }),
        state2.phase === "loading" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", children: t("loading") }),
        state2.preview && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { children: [
            t("related"),
            ": ",
            state2.preview.sessionIds.length - 1
          ] }),
          state2.preview.runningSessionIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: t("running") })
        ] }),
        busy && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", children: t("pending") }),
        state2.phase === "error" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "alert", children: t(state2.unavailable ? "unsupported" : state2.restartRequired ? "restart" : state2.changedScope ? "changed" : "failed") })
      ]
    }
  );
}
async function apply(ctx) {
  ctx.locale.register("ai-agent-engine", { en, zh });
  const statuses = initialModuleStatuses();
  await ctx.remote.$mount(pluginRpc);
  const translate = ctx.locale.bind("ai-agent-engine");
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "ai-agent-engine-compatibility",
    order: 421,
    label: translate("compatibility.section"),
    locale: "ai-agent-engine",
    inject: () => ({ remote: ctx.get("remote.aeCompatibility"), clientStatuses: statuses })
  }, CompatibilitySettingsPage));
  const updateRemote = ctx.get("remote.aeUpdate");
  if (updateRemote !== void 0) {
    statuses.update = { state: "ready" };
    ctx.slots.inject("settings.section", () => ctx.slots.register({
      name: "settings.section",
      id: "ai-agent-engine-update",
      order: 422,
      label: translate("update.section"),
      locale: "ai-agent-engine",
      inject: () => ({ remote: updateRemote })
    }, UpdateSettingsPage));
  }
  mountModule(ctx, "engineering", ["slots", "locale", "sessions", "uiWorkspace", "loader"], {
    slots: ["inject", "register", "entries", "subscribe"],
    locale: ["bind", "getSnapshot"],
    sessions: ["binding", "retainInfo"],
    uiWorkspace: ["openSession"],
    loader: ["entries"]
  }, statuses, async (scope) => {
    try {
      const configured = [...scope.loader.entries()].some((entry) => entry.options.name === "@deepseek-ai/dsh-experimental-client-ui-agent-team" && !entry.disabled);
      const existing = scope.slots.entries("conversation.session.header.actions").some((entry) => entry.options.id === "agent-team");
      if (!configured && !existing) {
        const official = await Promise.resolve().then(() => __toESM(require_agent_team_client(), 1));
        await scope.plugin(official);
      }
      installTeamPresentation(scope);
    } catch (error) {
      console.warn("AI Agent Engine team interface unavailable:", error instanceof Error ? error.message : "Unknown initialization error");
      throw error;
    }
  });
  mountModule(ctx, "deletion", ["slots", "locale", "remote", "remote.session", "configForms", "sessions", "uiWorkspace"], {
    configForms: ["describe"],
    sessions: ["retainInfo"],
    uiWorkspace: ["startSession"],
    remote: ["$on"],
    slots: ["inject", "register"]
  }, statuses, async (scope) => {
    mountDeletion(scope);
  });
  mountModule(ctx, "roles", ["slots", "locale", "remote"], {
    slots: ["inject", "register"],
    locale: ["bind", "subscribe"]
  }, statuses, async (scope) => {
    mountRoles(scope);
  });
}
function mountDeletion(ctx) {
  const settings = ctx.configForms.describe();
  const remote = ctx.get("remote.aeConversations");
  if (!remote) throw new Error("AI Agent Engine conversation API namespace was not mounted");
  const leaveDeleted = (ids) => {
    if (ids.some((id) => (ctx.sessions.retainInfo(id).getSnapshot().retainedBy.mainView ?? 0) > 0)) {
      ctx.uiWorkspace.startSession();
    }
  };
  ctx.remote.$on("api-session/removed", (id) => {
    leaveDeleted([id]);
  });
  const controller = createDeletionController(remote, leaveDeleted);
  ctx.effect(() => () => controller.dispose());
  const requestDeletion = async (sessionId, title) => {
    if (conversationManagementEnabled(settings.getSnapshot())) await controller.request(sessionId, title);
  };
  ctx.slots.inject("sidebar.workspaces.session.menu.item", () => ctx.slots.register({
    name: "sidebar.workspaces.session.menu.item",
    id: "ai-agent-engine-delete",
    order: 500,
    locale: "ai-agent-engine",
    inject: () => ({ hooks: { settings }, requestDeletion })
  }, DeleteMenuItem));
  ctx.slots.inject("sidebar.workspaces.session.row.action", () => ctx.slots.register({
    name: "sidebar.workspaces.session.row.action",
    id: "ai-agent-engine-context-menu",
    inject: () => ({ hooks: { settings } })
  }, RowContextMenu));
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay",
    id: "ai-agent-engine-delete",
    locale: "ai-agent-engine",
    inject: () => ({
      hooks: { deletion: controller.state, settings },
      confirm: controller.confirm,
      close: controller.close,
      requestDeletion
    })
  }, DeletionDialog));
}
function mountRoles(ctx) {
  const rolesRemote = ctx.get("remote.aeRoles");
  if (!rolesRemote) throw new Error("AI Agent Engine roles API namespace was not mounted");
  const translate = ctx.locale.bind("ai-agent-engine");
  const registerRolesSection = () => ctx.slots.register({
    name: "settings.section",
    id: "ai-agent-engine-roles",
    order: 420,
    label: translate("roles.section"),
    locale: "ai-agent-engine",
    inject: () => ({ roles: rolesRemote })
  }, RolesSettingsPage);
  ctx.slots.inject("settings.section", () => {
    let dispose = registerRolesSection();
    const refresh = () => {
      dispose();
      dispose = registerRolesSection();
    };
    const unsubscribe = ctx.locale.subscribe(refresh);
    return () => {
      unsubscribe();
      dispose();
    };
  });
}
return module.exports;}});
