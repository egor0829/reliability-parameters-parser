import React, {useEffect} from 'react';
import axios from 'axios';
import qs from 'qs';
import {useMount} from 'react-use';
import {useSearchParams} from 'react-router-dom';
import {Form, Button, Container, Row, Col, InputGroup} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Equipment} from 'src/types/equipment';
import EquipmentListItem from 'src/components/EquipmentListItem/EquipmentListItem';
import PaginationView from 'src/components/Pagination/Pagination';
import {RELIABILITY_PARAMETERS} from 'src/utils/reliability-parameters';
import {decoder} from 'src/utils/url';

type ReliabilityKeys = keyof typeof RELIABILITY_PARAMETERS;
type CheckboxesState = Record<ReliabilityKeys, boolean>;

type EquipmentReq = {
    name?: string;
    page?: number;
    size?: number;
    indicators?: CheckboxesState;
};

type EquipmentRes = {
    count: number;
    data: Equipment[];
};

interface Props {
    setActiveEquipmentListItem: (equipmentListItem: Equipment) => void;
}

const PAGE_SIZE = 10;

const EquipmentListPage: React.FC<Props> = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dataFromUrl = {
        page: searchParams.get('page'),
        name: searchParams.get('name'),
        indicators:
            searchParams.get('indicators') &&
            (qs.parse(searchParams.get('indicators')!, {decoder})?.indicators as qs.ParsedQs | null)
    };

    const checkboxesInitialState = Object.keys(RELIABILITY_PARAMETERS).reduce<CheckboxesState>((acc, key) => {
        acc[key] = false;
        return acc;
    }, {});

    const [currentPage, setCurrentPage] = React.useState<number>(
        (dataFromUrl.page && parseInt(dataFromUrl.page, 10)) || 1
    );
    const [equipmentRes, setEquipmentRes] = React.useState<EquipmentRes>();
    const [checkboxesState, setCheckboxesState] = React.useState<CheckboxesState>({
        ...checkboxesInitialState,
        ...dataFromUrl.indicators
    } as CheckboxesState);
    const [input, setInput] = React.useState<string>(dataFromUrl.name || '');

    const getEquipmentReq = async ({
        name = input,
        page = currentPage,
        size = PAGE_SIZE,
        indicators = checkboxesState
    }: EquipmentReq) => axios.get<EquipmentRes>('/api/v1/equipment', {params: {name, page, size, indicators}});

    const getEquipment = async (params?: Partial<EquipmentReq>) => {
        const equipmentRes = await getEquipmentReq(params || {});
        setEquipmentRes(equipmentRes.data);
    };

    useMount(() => getEquipment());

    useEffect(() => {
        setSearchParams({
            page: currentPage.toString(),
            name: input,
            indicators: qs.stringify(
                {indicators: checkboxesState},
                {
                    arrayFormat: 'brackets',
                    encode: false
                }
            )
        });
    }, [currentPage, input, checkboxesState]);

    const setPage = async (page: number) => {
        setCurrentPage(page);
        await getEquipment({page});
        scrollToTop();
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const setCheckbox = (key: ReliabilityKeys, value: boolean) => {
        const newCheckboxesState = {
            ...checkboxesState,
            [key]: value
        };
        setCheckboxesState(newCheckboxesState);
        getEquipment({indicators: newCheckboxesState});
    };

    const submit = async () => {
        setCurrentPage(1);
        await getEquipment();
        scrollToTop();
    };

    const clearInput = async () => {
        setInput('');
        setCurrentPage(1);
        await getEquipment({name: ''});
        scrollToTop();
    };

    return (
        <>
            <Container className="p-3 app">
                <Row className="mb-4">
                    <Col md={{span: 6, offset: 3}}>
                        <Row className="mb-2">
                            <Col md={{span: 9}} key="input">
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Название оборудования"
                                        type="text"
                                        value={input}
                                        onChange={(evt) => setInput(evt.target.value)}
                                    />
                                    <Button variant="outline-secondary" disabled={!input} onClick={clearInput}>
                                        <FontAwesomeIcon icon={faXmark} />
                                    </Button>
                                </InputGroup>
                            </Col>
                            <Col md={{span: 3}} key="submit">
                                <Button variant="primary" type="submit" onClick={submit}>
                                    Найти
                                </Button>
                            </Col>
                        </Row>
                        <div className="d-flex flex-row">
                            {Object.entries(checkboxesState).map(([label, checked]) => (
                                <div key={label} className="me-3">
                                    <Form.Check
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(evt) => setCheckbox(label, evt.target.checked)}
                                        label={label}
                                    />
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={{span: 8, offset: 2}}>
                        {equipmentRes && (equipmentRes?.data?.length ?? 0) > 0 ? (
                            <>
                                <Row className="m-2">{'Найдено ' + equipmentRes.count + ' результатов'}</Row>
                                {equipmentRes!.data?.map((equipmentItem) => (
                                    <EquipmentListItem
                                        equipmentItem={equipmentItem}
                                        setActiveEquipmentItem={props.setActiveEquipmentListItem}
                                    />
                                ))}
                            </>
                        ) : (
                            <p className="text-center">
                                <strong>Ничего не найдено</strong>
                            </p>
                        )}
                    </Col>
                </Row>
            </Container>
            {equipmentRes && (equipmentRes?.data?.length ?? 0) > 0 ? (
                <Container className="d-flex align-items-center justify-content-center">
                    <Row>
                        <PaginationView
                            page={currentPage}
                            setPage={setPage}
                            pagesCount={Math.floor(equipmentRes.count / PAGE_SIZE) + 1}
                        />
                    </Row>
                </Container>
            ) : null}
        </>
    );
};

export default EquipmentListPage;
