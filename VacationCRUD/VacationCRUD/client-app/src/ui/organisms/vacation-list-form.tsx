import { DatePicker, DayOfWeek, DefaultButton, Dialog, DialogType, IDatePickerStrings, Label, PrimaryButton, Stack } from "@fluentui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { UserInfoResp } from "../../api/response-models/user-info-response";
import { VacationListResp } from "../../api/response-models/vacation-list-response";
import { VacationResp } from "../../api/response-models/vacation-response";
import { messageService } from "../../classes/message-service";
import { VacAPIManager } from "../../classes/vac-api-manager";
import { TUser } from "../../types/user";
import { TVacation } from "../../types/vacation";
import { Loader } from "../atoms/loader";
import { SeparatorTitle } from "../atoms/separator-title";

type TProps = {
    setActivePivot: React.Dispatch<React.SetStateAction<string>>;
};

const ruStrings: IDatePickerStrings = {
    isRequiredErrorMessage: "Обязательное поле",
    invalidInputErrorMessage: "Некорректная дата",
    isOutOfBoundsErrorMessage: "Дата выходит за допустимые границы",
    isResetStatusMessage: "Возвращено исходное значение",
    goToToday: "Текущая дата",
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    shortMonths: ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сент", "Окт", "Нояб", "Дек"],
    days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    shortDays: ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"]
};

const primaryStyles = {
    root: {
        paddingLeft: 8,
        paddingRight: 8,
        marginRight: 4
    }
};
const baseStyles = {
    root: {
        backgroundColor: "#E74856",
        color: "#fff",
        paddingLeft: 8,
        paddingRight: 8,
        marginRight: 4
    },
    rootHovered: {
        backgroundColor: "#D13438",
        color: "#fff"
    }
};

const VacationListForm = ({ setActivePivot }: TProps): JSX.Element => {
    const [isLoading, setIsLoading] = useState(true);
    const [vacations, setVacations] = useState<Array<TVacation & { changed: boolean }>>([]);
    const [userInfo, setUserInfo] = useState<TUser>();
    const [isDialogHidden, setIsDialogHidden] = useState(true);
    const [dialogVac, setDialogVac] = useState<TVacation>({ id: -1, startDate: new Date(), endDate: new Date() });
    const [daysPlanned, setDaysPlanned] = useState(0);

    const modalProps = React.useMemo(
        () => ({
            isBlocking: true,
            styles: { main: { maxWidth: 450 } },
            dragOptions: undefined
        }),
        [false]
    );
    const dialogContentProps = {
        type: DialogType.normal,
        title: "Добавление периода отпуска",
        subText: `Выберите даты (доступно ${(userInfo?.totalVacationDays || 0) - (userInfo?.usedVacationDays || 0)}):`
    };

    async function getVacations() {
        setIsLoading(true);
        const vacationList = await VacAPIManager.request<VacationListResp>(async (api) => {
            return await api.readVacationList();
        });
        if (!vacationList.data) {
            vacationList.errors.forEach((e) => messageService.sendError(e));
        }
        else {
            setVacations(vacationList.data.data.map((v) => { return { changed: false, ...v }; }));
            setDaysPlanned(sumVacations(vacationList.data.data));
        }
        setIsLoading(false);
    }

    function sumVacations(list: Array<TVacation | TVacation & {changed: boolean}> = vacations) {
        let sum: number = 0;
        list.forEach((v) => {
            sum += diffInDays(v);
        })
        return sum;
    }

    async function getUserInfo() {
        setIsLoading(true);
        const userInfo = await VacAPIManager.request<UserInfoResp>(async (api) => {
            return await api.getUserInfo();
        });
        if (!userInfo.data || !userInfo.data.data) {
            userInfo.errors.forEach((e) => messageService.sendError(e));
        }
        else {
            setUserInfo(userInfo.data.data);
        }
        setIsLoading(false);
    }

    async function deleteVacation(id: number) {
        setIsLoading(true);
        const result = await VacAPIManager.request<VacationResp>(async (api) => {
            return await api.deleteVacation(id);
        });
        if (!result.data) {
            result.errors.forEach((e) => messageService.sendError(e));
        }
        else {
            messageService.sendInfo("Запись удалена.");
        }
        setVacations(vacations.filter((v) => v.id != id));
        setDaysPlanned(sumVacations());
        setIsLoading(false);
    }

    async function deleteAllVacations() {
        setIsLoading(true);
        for (let i = 0; i < vacations.length; i++) {
            const result = await VacAPIManager.request<VacationResp>(async (api) => {
                return await api.deleteVacation(vacations[i].id);
            });
            if (!result.data) {
                result.errors.forEach((e) => messageService.sendError(e));
            }
        }
        setVacations([]);
        setDaysPlanned(0);
        setIsLoading(false);
        await getUserInfo();
        messageService.sendInfo("Записи удалены.");
    }

    function formatDate(date?: Date): string {
        return date?.toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit', year: '2-digit' }) || "";
    }

    function diffInDays(vacation: TVacation): number {
        return Math.ceil(Math.abs(vacation.endDate.getTime() - vacation.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    function changeDateFrom(id: number, date: Date | null | undefined) {
        if (!date) return;
        const tVacations = vacations;
        tVacations.forEach((v) => {
            if (v.id == id) {
                v.startDate = date;
                v.changed = true;
            }
        });
        setVacations(tVacations);
        setDaysPlanned(sumVacations());
    }

    function changeDateTo(id: number, date: Date | null | undefined) {
        if (!date) return;
        const tVacations = vacations;
        tVacations.forEach((v) => {
            if (v.id == id) {
                v.endDate = date;
                v.changed = true;
            }
        });
        setVacations(tVacations);
        setDaysPlanned(sumVacations());
    }

    async function revertChanges(id: number) {
        setIsLoading(true);
        const vacation = await VacAPIManager.request<VacationResp>(async (api) => {
            return await api.readVacation(id);
        });
        if (!vacation.data) {
            vacation.errors.forEach((e) => messageService.sendError(e));
        }
        else {
            const tVacations = vacations;
            tVacations.map((v) => {
                if (v.id == id) {
                    v.changed = false;
                    v.startDate = vacation.data?.data?.startDate ?? v.startDate;
                    v.endDate = vacation.data?.data?.endDate ?? v.endDate;
                }
            });
            setVacations(tVacations);
            setDaysPlanned(sumVacations());
            messageService.sendInfo("Изменения отменены.");
        }
        setIsLoading(false);
    }

    async function updateVacation(id: number) {
        setIsLoading(true);
        const curVac = vacations.find((v) => v.id == id);
        if (!curVac) {
            messageService.sendError("Вызов updateVacation с недействительным id!");
        }
        else {
            const vacation = await VacAPIManager.request<VacationResp>(async (api) => {
                return await api.updateVacation(id, curVac.startDate, curVac.endDate);
            });
            if (!vacation.data) {
                vacation.errors.forEach((e) => messageService.sendError(e));
            }
            else {
                const tVacations = vacations;
                tVacations.map((v) => {
                    if (v.id == id) {
                        v.changed = false;
                        v.startDate = vacation.data?.data?.startDate ?? v.startDate;
                        v.endDate = vacation.data?.data?.endDate ?? v.endDate;
                    }
                });
                setVacations(tVacations);
                setDaysPlanned(sumVacations());
                await getUserInfo();
                messageService.sendSuccess("Изменения отправлены.");
            }
        }
        setIsLoading(false);
    }

    function addVacation() {
        if (daysPlanned < (userInfo?.totalVacationDays ?? 0)) {
            setDialogVac({ id: -1, startDate: new Date(), endDate: new Date() });
            setIsDialogHidden(false);
        }
        else if (vacations.find((v) => v.changed)) {
            messageService.sendInfo("Имеются несохранённые изменения");
        }
        else {
            messageService.sendInfo("Недостаточно дней для добавления");
        }
    }

    async function confirmAddingVacation() {
        setIsLoading(true);
        const vacation = await VacAPIManager.request<VacationResp>(async (api) => {
            return await api.createVacation(dialogVac.startDate, dialogVac.endDate);
        });
        if (!vacation.data || !vacation.data.data) {
            vacation.errors.forEach((e) => messageService.sendError(e));
        }
        else {
            const tVacations = vacations;
            tVacations.push({ ...vacation.data.data, changed: false });
            setVacations(tVacations);
            setDaysPlanned(sumVacations());
            await getUserInfo();
            messageService.sendSuccess("Период добавлен.");
        }
        setIsDialogHidden(true);
        setIsLoading(false);
    }

    useEffect(() => {
        getUserInfo().then(
            () => getVacations()
        );
    }, []);

    return (
        <Stack>
            {isLoading && <Loader />}
            <div className="user-card">
                <Stack>
                    <h2>{userInfo?.login || "Аноним"}</h2>
                    <h5>Дни отпуска (БД): {userInfo?.usedVacationDays ?? 0}/{userInfo?.totalVacationDays ?? 0}</h5>
                </Stack>
            </div>
            <SeparatorTitle text="Мои отпуска" />
            {vacations.length > 0
                ? vacations.map((vacation) => {
                    return (
                        <div className="vacation-card">
                            <Stack>
                                <DatePicker
                                    isRequired
                                    formatDate={formatDate}
                                    firstDayOfWeek={DayOfWeek.Monday}
                                    label="С даты:"
                                    placeholder="Выберите дату..."
                                    ariaLabel="Выберите дату"
                                    strings={ruStrings}
                                    value={vacation.startDate}
                                    onSelectDate={(date) => changeDateFrom(vacation.id, date)}
                                />
                                <DatePicker
                                    isRequired
                                    formatDate={formatDate}
                                    firstDayOfWeek={DayOfWeek.Monday}
                                    label="По дату:"
                                    placeholder="Выберите дату..."
                                    ariaLabel="Выберите дату"
                                    strings={ruStrings}
                                    value={vacation.endDate}
                                    onSelectDate={(date) => changeDateTo(vacation.id, date)}
                                />
                                <p>Дней: {diffInDays(vacation) ?? "-"}</p>
                                <Stack horizontal className="vac-list-controls">
                                    <PrimaryButton
                                        disabled={!vacation.changed}
                                        styles={primaryStyles}
                                        onClick={() => updateVacation(vacation.id)}
                                        text="Сохранить"
                                    />
                                    <DefaultButton
                                        disabled={!vacation.changed}
                                        styles={baseStyles}
                                        onClick={() => revertChanges(vacation.id)}
                                        text="Отмена"
                                    />
                                    <DefaultButton
                                        styles={baseStyles}
                                        onClick={() => {
                                            deleteVacation(vacation.id);
                                            getUserInfo();
                                        }}
                                        text="Удалить"
                                    />
                                </Stack>
                            </Stack>
                        </div>
                    )
                })
                : <div className="empty">Ничего не нашлось :(</div>
            }
            <div className="totalDays">
                <Label>{"Запланировано (c учётом изменений): "+daysPlanned}</Label>
            </div>
            <Dialog
                hidden={isDialogHidden}
                onDismiss={() => setIsDialogHidden(true)}
                closeButtonAriaLabel="Закрыть"
                dialogContentProps={dialogContentProps}
                modalProps={modalProps}
            >
                <Stack>
                    <DatePicker
                        isRequired
                        formatDate={formatDate}
                        firstDayOfWeek={DayOfWeek.Monday}
                        label="С даты:"
                        placeholder="Выберите дату..."
                        ariaLabel="Выберите дату"
                        strings={ruStrings}
                        value={dialogVac.startDate}
                        onSelectDate={(date) => setDialogVac({ ...dialogVac, startDate: date || new Date() })}
                    />
                    <DatePicker
                        isRequired
                        formatDate={formatDate}
                        firstDayOfWeek={DayOfWeek.Monday}
                        label="По дату:"
                        placeholder="Выберите дату..."
                        ariaLabel="Выберите дату"
                        strings={ruStrings}
                        value={dialogVac.endDate}
                        onSelectDate={(date) => setDialogVac({ ...dialogVac, endDate: date || new Date() })}
                    />
                    <p>Дней: {diffInDays(dialogVac)}</p>
                </Stack>
                <Stack horizontal>
                    <PrimaryButton
                        styles={primaryStyles}
                        onClick={confirmAddingVacation}
                        text="Добавить" />
                    <DefaultButton
                        styles={baseStyles}
                        onClick={() => setIsDialogHidden(true)}
                        text="Отмена" />
                </Stack>
            </Dialog>
            <Stack horizontal className="vac-list-controls">
                <PrimaryButton
                    styles={primaryStyles}
                    onClick={addVacation}
                    text="Добавить"
                />
                <DefaultButton
                    styles={primaryStyles}
                    onClick={() => getVacations().then(()=> getUserInfo())}
                    text="Обновить"
                />
                <DefaultButton
                    styles={baseStyles}
                    onClick={deleteAllVacations}
                    text="Удалить все"
                />
            </Stack>
        </Stack>
    );
}

export { VacationListForm };