import {
    Page,
    TextField,
    Button,
    ResourceList,
    DatePicker,
    FormLayout,
    Toast,
    Banner,
    Card,
    Layout,
    Select,
    Text,
    Frame,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
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
    // const fetch = usefetch();
    const [blackouts, setBlackouts] = useState([]);
    const [slots, setSlots] = useState([]);
    const [cutoffSame, setCutoffSame] = useState("");
    const [cutoffNext, setCutoffNext] = useState("");
    const [time, setTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [toastActive, setToastActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Time slot options (e.g., 1-hour windows)
    const timeOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, "0");
        return { label: `${hour}:00 - ${hour}:59`, value: `${hour}:00` };
    });

    // Fetch settings
    useEffect(() => {
        if (!shop) return;
        setIsLoading(true);
        fetch(`/api/delivery/settings?shop=${shop}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch settings");
                return res.json();
            })
            .then((data) => {
                console.log("Fetched settings:", data);
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
    }, [shop]);

    // Handle date picker changes
    const handleDateChange = useCallback(({ start, end }) => {
        setSelectedDates({ start, end });
    }, []);

    const handleMonthChange = useCallback((month, year) => {
        setMonth(month);
        setYear(year);
    }, []);

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
    }, [blackouts, selectedDates]);
    console.log(blackouts, "Blackouts state after adding new dates");
    // Add time slot
    const addSlot = useCallback(() => {
        const timeError = validateTime(time);
        const capacityError = validateCapacity(capacity);
        if (timeError || capacityError || !time || !capacity) {
            setErrorMessage(timeError || capacityError || "Please fill in both time and capacity");
            return;
        }
        if (slots.some((slot) => slot.time === time)) {
            setErrorMessage("This time slot already exists");
            return;
        }
        setSlots([...slots, { time, capacity: parseInt(capacity, 10) }].sort((a, b) =>
            a.time.localeCompare(b.time)
        ));
        setTime("");
        setCapacity("");
        setErrorMessage("");
    }, [time, capacity, slots]);

    // Save settings
    const save = useCallback(() => {
        const cutoffSameError = validateTime(cutoffSame);
        const cutoffNextError = validateTime(cutoffNext);
        if (cutoffSameError || cutoffNextError) {
            setErrorMessage(cutoffSameError || cutoffNextError);
            return;
        }
        setIsLoading(true);
        fetch("/api/delivery/settings", {
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
            });
    }, [shop, blackouts, slots, cutoffSame, cutoffNext]);

    // Reset to initial state
    const reset = useCallback(() => {
        setBlackouts([]);
        setSlots([]);
        setCutoffSame("");
        setCutoffNext("");
        setTime("");
        setCapacity("");
        setErrorMessage("");
    }, []);

    return (
        <Frame>
            <Page
                title="Delivery Settings"
                primaryAction={{
                    content: "Save Settings",
                    onAction: save,
                    loading: isLoading,
                    disabled: isLoading,
                }}
                secondaryActions={[
                    {
                        content: "Reset",
                        onAction: reset,
                        disabled: isLoading,
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

                    <Layout.Section>
                        <Card>
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
                                    onChange={setCutoffSame}
                                    error={validateTime(cutoffSame)}
                                    id="cutoff-same"
                                    aria-label="Same-day cutoff time"
                                />
                                <TextField
                                    label="Next-day Cutoff Time (HH:MM)"
                                    value={cutoffNext}
                                    onChange={setCutoffNext}
                                    error={validateTime(cutoffNext)}
                                    id="cutoff-next"
                                    aria-label="Next-day cutoff time"
                                />
                            </FormLayout>
                        </Card>
                    </Layout.Section>

                    <Layout.Section>
                        <Card>
                            <FormLayout>
                                <Text variant="headingMd">Delivery Time Slots</Text>
                                <Select
                                    label="Time Range"
                                    options={timeOptions}
                                    value={time}
                                    onChange={setTime}
                                    placeholder="Select a time range"
                                    id="time-slot"
                                    aria-label="Delivery time slot"
                                />
                                <TextField
                                    type="number"
                                    label="Max Orders (Capacity)"
                                    value={capacity}
                                    onChange={setCapacity}
                                    error={validateCapacity(capacity)}
                                    id="capacity"
                                    aria-label="Maximum orders capacity"
                                />
                                <Button onClick={addSlot} disabled={isLoading}>
                                    Add Time Slot
                                </Button>
                                <ResourceList
                                    resourceName={{ singular: "slot", plural: "slots" }}
                                    items={slots}
                                    renderItem={(item, index) => (
                                        <ResourceList.Item id={index}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span>
                                                    <strong>{item.time}</strong> — {item.capacity} orders max
                                                </span>
                                                <Button
                                                    plain
                                                    destructive
                                                    onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                                                    disabled={isLoading}
                                                    aria-label={`Remove time slot ${item.time}`}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </ResourceList.Item>
                                    )}
                                />
                            </FormLayout>
                        </Card>
                    </Layout.Section>

                    <Layout.Section>
                        <Card>
                            <FormLayout>
                                <Text variant="headingMd">Blackout Dates</Text>
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
                                <Button onClick={addBlackout} disabled={isLoading}>
                                    Add Blackout Date(s)
                                </Button>
                                <ResourceList
                                    resourceName={{ singular: "date", plural: "dates" }}
                                    items={blackouts}
                                    renderItem={(date, index) => (
                                        <ResourceList.Item id={index}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <strong>{date}</strong>
                                                <Button
                                                    plain
                                                    destructive
                                                    onClick={() => setBlackouts((prev) => prev.filter((d) => d !== date))}
                                                    disabled={isLoading}
                                                    aria-label={`Remove blackout date ${date}`}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </ResourceList.Item>
                                    )}
                                />
                            </FormLayout>
                        </Card>
                    </Layout.Section>
                </Layout>

                {toastActive && <Toast content="Delivery settings saved!" onDismiss={() => setToastActive(false)} duration={4500} />}
            </Page>
        </Frame>
    );
}