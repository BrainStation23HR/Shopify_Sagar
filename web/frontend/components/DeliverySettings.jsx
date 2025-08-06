import {
    Page,
    TextField,
    Button,
    ResourceList,
    DatePicker,
    FormLayout,
    Toast,
    Banner,
    LegacyCard,
    Layout,
    Select,
    Text,
    Frame,
    Icon,
    Collapsible,
} from "@shopify/polaris";
import {
    SaveBar,
    useAppBridge,
} from "@shopify/app-bridge-react";
import { ChevronDownMinor } from '@shopify/polaris-icons';
// Removed zone components
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
// Utility to validate 24-hour time format (HH:MM)
const validateTime = (value) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value) ? "" : "Please use 24-hour format (e.g., 14:00)";
};

// Utility to validate positive integer
const validateCapacity = (value) => {
    const num = parseInt(value, 10);
    return Number.isInteger(num) && num > 0 ? "" : "Please enter a positive integer";
};

export default function DeliverySettings({ shop }) {
    const [blackoutListCollapsed, setBlackoutListCollapsed] = useState(false);
    const [blackoutCollapsed, setBlackoutCollapsed] = useState(false);
    const [slotListCollapsed, setSlotListCollapsed] = useState(false);
    const [blackouts, setBlackouts] = useState([]);
    const [slots, setSlots] = useState([]);
    const [cutoffSame, setCutoffSame] = useState("");
    const [cutoffNext, setCutoffNext] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [toastActive, setToastActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    // Only one slot input, not dynamic
    const [slotInput, setSlotInput] = useState({ startTime: "", endTime: "", capacity: "" });


    const fetchSettings = () => {
        fetch(`/api/admin/delivery/settings?shop=${shop}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch settings");
                return res.json();
            })
            .then((data) => {
                setBlackouts((data.settings.blackout_dates).sort());
                setSlots((data.settings.time_slots).sort((a, b) => a.time.localeCompare(b.time)));
                setCutoffSame(data.settings.cutoff_same_day || "");
                setCutoffNext(data.settings.cutoff_next_day || "");
            })
            .catch((error) => {
                setErrorMessage(error.message || "Failed to load settings");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }
    // Fetch global delivery settings
    useEffect(() => {
        if (!shop) return;
        setIsLoading(true);
        fetchSettings();
    }, [shop]);


    // Handle date picker changes
    const handleDateChange = useCallback(({ start, end }) => {
        setSelectedDates({ start, end });
    }, []);

    const handleMonthChange = useCallback((month, year) => {
        setMonth(month);
        setYear(year);
    }, []);

    // Update cutoff times
    const handleCutoffSameChange = (val) => {
        setCutoffSame(val);
        setIsDirty(true);
    };
    const handleCutoffNextChange = (val) => {
        setCutoffNext(val);
        setIsDirty(true);
    };

    // Add blackout dates
    const addBlackout = useCallback(() => {
        const start = dayjs(selectedDates.start);
        const end = dayjs(selectedDates.end);
        const newDates = [];
        for (let date = start; date.isBefore(end) || date.isSame(end, "day"); date = date.add(1, "day")) {
            const formattedDate = date.format("YYYY-MM-DD");
            if (!blackouts.includes(formattedDate)) {
                newDates.push(formattedDate);
            }
        }
        setBlackouts([...blackouts, ...newDates].sort());
        setIsDirty(true);
    }, [blackouts, selectedDates]);

    // Update slot input field
    const updateSlotInput = (field, value) => {
        setSlotInput({ ...slotInput, [field]: value });
        setIsDirty(true);
    };

    // Remove blackout date
    const removeBlackoutDate = (date) => {
        setBlackouts((prev) => prev.filter((d) => d !== date));
        setIsDirty(true);
    };

    // Add slot to slots state
    const addSlot = () => {
        const startError = validateTime(slotInput.startTime);
        const endError = validateTime(slotInput.endTime);
        const capacityError = validateCapacity(slotInput.capacity);
        if (startError || endError || capacityError || !slotInput.startTime || !slotInput.endTime || !slotInput.capacity) {
            setErrorMessage(startError || endError || capacityError || "Please fill in all fields");
            return;
        }
        if (slots.some((slot) => slot.startTime === slotInput.startTime && slot.endTime === slotInput.endTime)) {
            setErrorMessage("This time slot already exists");
            return;
        }
        setSlots([...slots, {
            startTime: slotInput.startTime,
            endTime: slotInput.endTime,
            capacity: parseInt(slotInput.capacity, 10)
        }].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        setSlotInput({ startTime: "", endTime: "", capacity: "" });
        setErrorMessage("");
        setIsDirty(true);
    };

    // Remove slot from slots state
    const removeSlot = (index) => {
        setSlots((prev) => prev.filter((item) => item.startTime !== slots[index].startTime || item.endTime !== slots[index].endTime));
        setIsDirty(true);
    };

    // Save settings
    const save = useCallback(() => {
        const cutoffSameError = validateTime(cutoffSame);
        const cutoffNextError = validateTime(cutoffNext);
        if (cutoffSameError || cutoffNextError) {
            setErrorMessage(cutoffSameError || cutoffNextError);
            return;
        }
        setIsLoading(true);
        fetch("/api/admin/delivery/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shop,
                blackout_dates: blackouts,
                time_slots: slots,
                cutoff_same_day: cutoffSame,
                cutoff_next_day: cutoffNext,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save settings");
                setToastActive(true);
                setErrorMessage("");
            })
            .catch((error) => {
                setErrorMessage(error.message || "Failed to save settings");
            })
            .finally(() => {
                setIsLoading(false);
                setIsDirty(false);
            });
    }, [shop, blackouts, slots, cutoffSame, cutoffNext]);

    // Reset to initial state
    // Restore DB state
    const discardChanges = useCallback(() => {
        setIsLoading(true);
        fetchSettings();
        setIsDirty(false);
    }, []);

    // Clear all input fields
    const reset = useCallback(() => {
        setBlackouts([]);
        setSlots([]);
        setCutoffSame("");
        setCutoffNext("");
        setSlotInput({ startTime: "", endTime: "", capacity: "" });
        setErrorMessage("");
        setIsDirty(true);
    }, []);

    // No zone CRUD
    return (
        <Frame>
            <Page
                title="Delivery Settings"
                primaryAction={{
                    content: isDirty ? "Save Settings" : "No changes",
                    onAction: save,
                    loading: isLoading,
                    disabled: isLoading,
                }}
                secondaryActions={[
                    {
                        content: "Reset",
                        onAction: reset,
                        disabled: isLoading,
                        destructive: true,
                    },
                ]}

            >
                <Layout>
                    {errorMessage && (
                        <Layout.Section>
                            <Banner status="critical" title="Error">
                                {errorMessage}
                            </Banner>
                        </Layout.Section>
                    )}
                    {/* Global blackout/cutoff/time slot settings */}
                    <Layout.Section>
                        <LegacyCard>
                            <div style={{ padding: '24px' }}>
                                <FormLayout>
                                    <Text variant="headingMd">Cutoff Times</Text>
                                    <Banner status="info">
                                        <p>
                                            Use 24-hour format (e.g., <code>14:00</code>) to block same-day or next-day
                                            delivery based on selection time.
                                        </p>
                                    </Banner>
                                    <TextField
                                        label="Same-day Cutoff Time (HH:MM)"
                                        value={cutoffSame}
                                        onChange={handleCutoffSameChange}
                                        error={validateTime(cutoffSame)}
                                        id="cutoff-same"
                                        aria-label="Same-day cutoff time"
                                    />
                                    <TextField
                                        label="Next-day Cutoff Time (HH:MM)"
                                        value={cutoffNext}
                                        onChange={handleCutoffNextChange}
                                        error={validateTime(cutoffNext)}
                                        id="cutoff-next"
                                        aria-label="Next-day cutoff time"
                                    />
                                </FormLayout>
                            </div>
                        </LegacyCard>
                    </Layout.Section>
                    <Layout.Section>
                        <LegacyCard>
                            <div style={{ padding: '24px' }}>
                                <FormLayout>
                                    <Text variant="headingMd">Delivery Time Slots</Text>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 8 }}>
                                        <TextField
                                            label="Start Time(HH:MM)"
                                            value={slotInput.startTime}
                                            onChange={(val) => updateSlotInput("startTime", val)}
                                            id="start-time"
                                            aria-label="Start time"
                                            autoComplete="off"
                                            type="time"
                                            step="60"
                                        />
                                        <Text variant="bodyMd" style={{ marginBottom: 8 }}>to</Text>
                                        <TextField
                                            label="End Time (HH:MM)"
                                            value={slotInput.endTime}
                                            onChange={(val) => updateSlotInput("endTime", val)}
                                            id="end-time"
                                            aria-label="End time"
                                            autoComplete="off"
                                            type="time"
                                            step="60"
                                        />
                                        <TextField
                                            type="number"
                                            label="Max Orders (Capacity)"
                                            value={slotInput.capacity}
                                            onChange={(val) => updateSlotInput("capacity", val)}
                                            id="capacity"
                                            aria-label="Maximum orders capacity"
                                            autoComplete="off"
                                        />
                                        <Button onClick={addSlot} disabled={isLoading} primary>
                                            Add
                                        </Button>
                                    </div>
                                    {errorMessage && (
                                        <span style={{ fontSize: '12px', color: '#d72c0d', lineHeight: 1, marginTop: 4, display: 'block' }}>{errorMessage}</span>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text variant="headingSm">Time Slots List</Text>
                                        <Button
                                            onClick={() => setSlotListCollapsed((prev) => !prev)}
                                            aria-label={slotListCollapsed ? 'Expand Time Slots List' : 'Collapse Time Slots List'}
                                            plain
                                            style={{ padding: 0, minWidth: 24 }}
                                        >
                                            <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: slotListCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                                                <Icon source={ChevronDownMinor} color="base" />
                                            </span>
                                        </Button>
                                    </div>
                                    <Collapsible
                                        open={!slotListCollapsed}
                                        transition={{ duration: '300ms', timingFunction: 'ease-in-out' }}
                                    >
                                        <ResourceList
                                            resourceName={{ singular: "slot", plural: "slots" }}
                                            items={slots}
                                            renderItem={(item, index) => (
                                                <ResourceList.Item id={index}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <span>
                                                            <strong>{item.startTime} - {item.endTime}</strong> — {item.capacity} orders max
                                                        </span>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', width: 120 }}>
                                                            <Button
                                                                plain
                                                                destructive
                                                                onClick={() => removeSlot(index)}
                                                                disabled={isLoading}
                                                                aria-label={`Remove time slot ${item.startTime} - ${item.endTime}`}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </ResourceList.Item>
                                            )}
                                        />
                                    </Collapsible>
                                </FormLayout>
                            </div>
                        </LegacyCard>
                    </Layout.Section>
                    <Layout.Section>
                        <LegacyCard>
                            <div style={{ padding: '24px' }}>
                                <FormLayout>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text variant="headingMd">Blackout Dates</Text>
                                        <Button
                                            onClick={() => setBlackoutCollapsed((prev) => !prev)}
                                            aria-label={blackoutCollapsed ? 'Expand Blackout Dates' : 'Collapse Blackout Dates'}
                                            plain
                                            style={{ padding: 0, minWidth: 24 }}
                                        >
                                            <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: blackoutCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                                                <Icon source={ChevronDownMinor} color="base" />
                                            </span>
                                        </Button>
                                    </div>
                                    <Collapsible
                                        open={!blackoutCollapsed}
                                        transition={{ duration: '300ms', timingFunction: 'ease-in-out' }}
                                    >
                                        <>
                                            <DatePicker
                                                month={month}
                                                year={year}
                                                selected={selectedDates}
                                                onChange={handleDateChange}
                                                onMonthChange={handleMonthChange}
                                                disableDatesBefore={new Date()}
                                                multiMonth={false}
                                                allowRange
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                                                <Button onClick={addBlackout} disabled={isLoading}>
                                                    Add Blackout Date(s)
                                                </Button>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <Text variant="headingSm">Blackout Dates List</Text>
                                                <Button
                                                    onClick={() => setBlackoutListCollapsed((prev) => !prev)}
                                                    aria-label={blackoutListCollapsed ? 'Expand Blackout Dates List' : 'Collapse Blackout Dates List'}
                                                    plain
                                                    style={{ padding: 0, minWidth: 24 }}
                                                >
                                                    <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: blackoutListCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                                                        <Icon source={ChevronDownMinor} color="base" />
                                                    </span>
                                                </Button>
                                            </div>
                                            <Collapsible
                                                open={!blackoutListCollapsed}
                                                transition={{ duration: '300ms', timingFunction: 'ease-in-out' }}
                                            >
                                                <ResourceList
                                                    resourceName={{ singular: "date", plural: "dates" }}
                                                    items={blackouts}
                                                    renderItem={(date, index) => (
                                                        <ResourceList.Item id={index}>
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                                <strong>{date}</strong>
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end', width: 120 }}>
                                                                    <Button
                                                                        plain
                                                                        destructive
                                                                        onClick={() => removeBlackoutDate(date)}
                                                                        disabled={isLoading}
                                                                        aria-label={`Remove blackout date ${date}`}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </ResourceList.Item>
                                                    )}
                                                />
                                            </Collapsible>

                                        </>
                                    </Collapsible>
                                </FormLayout>
                            </div>
                        </LegacyCard>
                    </Layout.Section>
                    {/* No Delivery Zones section here */}
                </Layout>

                {toastActive && <Toast content="Settings saved to database!" onDismiss={() => setToastActive(false)} duration={4500} />}
                <SaveBar id="my-save-bar" open={isDirty}>
                    <button
                        variant="primary"
                        onClick={save}
                        disabled={isLoading}
                    >
                        Save
                    </button>
                    <button onClick={discardChanges} disabled={isLoading}>Discard</button>
                </SaveBar>
            </Page>
        </Frame>
    );
}