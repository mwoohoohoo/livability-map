import { AnimatePresence, motion } from "motion/react";
import ScoreSidebar from "./ScoreSidebar";

export default function ScoreSheet({
  isOpen,
  onClose,
  variables,
  settings,
  defaultSettings,
  onImportanceChange,
  onRemove,
  onDealbreakerChange,
  onReset,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Close score weighting"
            className="
              fixed
              inset-0
              z-40
              cursor-default
              bg-black/20
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Desktop / tablet side panel */}
          <motion.div
            className="
              fixed
              inset-y-0
              left-0
              z-50
              hidden
              w-[360px]
              shadow-2xl
              md:block
              lg:hidden
            "
            initial={{
              x: "-100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "-100%",
            }}
            transition={{
              type: "tween",
              duration: 0.25,
            }}
          >
            <ScoreSidebar
              variables={variables}
              settings={settings}
              defaultSettings={defaultSettings}
              onImportanceChange={onImportanceChange}
              onRemove={onRemove}
              onDealbreakerChange={onDealbreakerChange}
              onReset={onReset}
              onClose={onClose}
              onView={onClose}
              isSheet
            />
          </motion.div>

          {/* Mobile bottom sheet */}
          <motion.div
            className="
              fixed
              inset-x-0
              bottom-0
              z-50
              h-[100dvh]
              md:hidden
            "
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{
              type: "tween",
              duration: 0.3,
            }}
          >
            <ScoreSidebar
              variables={variables}
              settings={settings}
              defaultSettings={defaultSettings}
              onImportanceChange={onImportanceChange}
              onRemove={onRemove}
              onDealbreakerChange={onDealbreakerChange}
              onReset={onReset}
              onClose={onClose}
              onView={onClose}
              isSheet
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
