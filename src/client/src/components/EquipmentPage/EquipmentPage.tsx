import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Container, Table, Row, Col, Image, Button, Spinner} from 'react-bootstrap';
import {Equipment} from 'src/types/equipment';
import {format} from 'date-fns';
import {RELIABILITY_PARAMETERS} from 'src/utils/reliability-parameters';
import {useMount} from 'react-use';

interface Props {
    equipmentItem: Equipment | null;
}

const EquipmentPage: React.FC<Props> = (props) => {
    const {equipmentId} = useParams();
    const navigate = useNavigate();
    const [equipmentItem, setEquipmentItem] = React.useState<Equipment | null>(props.equipmentItem);

    const getEquipmentByIdReq = async (id: string) => axios.get<Equipment>('/api/v1/equipment/' + id);

    useMount(async () => {
        if (!props.equipmentItem) {
            const equipmentItemRes = await getEquipmentByIdReq(equipmentId!);
            setEquipmentItem(equipmentItemRes.data);
        }
    });

    const onBackClick = () => {
        navigate(-1);
    };

    const renderEquipmentInfo = (equipmentItem: Equipment) => (
        <>
            <Row className="mb-4">
                <Col md={4}>
                    {equipmentItem.imageUrl ? <Image src={equipmentItem.imageUrl} rounded thumbnail /> : null}
                </Col>
                <Col md={8}>
                    <Row>
                        <h4>{equipmentItem.name}</h4>
                    </Row>
                    {equipmentItem.date ? (
                        <Row>
                            <p>
                                <u>{'Обновлено ' + format(new Date(equipmentItem.date), 'dd.MM.yyyy')}</u>
                            </p>
                        </Row>
                    ) : null}
                    {equipmentItem.url ? (
                        <Row className="mb-3">
                            <a href={equipmentItem.url} className="link-primary">
                                {equipmentItem.url}
                            </a>
                        </Row>
                    ) : null}
                    {equipmentItem.description ? (
                        <Row>
                            <p>
                                {equipmentItem.description.split(' ').map((phrase) => {
                                    const shouldHighlight = Object.values(RELIABILITY_PARAMETERS).find(
                                        (reliabilityStrs) => {
                                            return reliabilityStrs.find((reliabilityStr) =>
                                                phrase.toLowerCase().includes(reliabilityStr.toLowerCase())
                                            );
                                        }
                                    );
                                    return shouldHighlight ? (
                                        <span className="bg-warning">{phrase + ' '}</span>
                                    ) : (
                                        phrase + ' '
                                    );
                                })}
                            </p>
                        </Row>
                    ) : null}
                </Col>
            </Row>
            {equipmentItem.details ? (
                <Row>
                    <Table striped bordered hover>
                        <tbody>
                            {Object.entries(equipmentItem.details).map(([key, value]) => {
                                const shouldHighlight = Object.values(RELIABILITY_PARAMETERS).find(
                                    (reliabilityValues) => {
                                        return reliabilityValues.find(
                                            (reliabilityValue) => reliabilityValue.toLowerCase() === key.toLowerCase()
                                        );
                                    }
                                );
                                return (
                                    <tr className={shouldHighlight ? 'table-warning' : ''}>
                                        <td>{key}</td>
                                        <td>{value}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Row>
            ) : null}
            {equipmentItem.goodImageUrls ? (
                <Row>
                    {Array(Math.floor(equipmentItem.goodImageUrls.length / 4) + 1)
                        .fill(undefined)
                        .map((_, rowIndex) => {
                            const imgsRestCount = equipmentItem.goodImageUrls!.length - rowIndex * 4;
                            const colsCount = imgsRestCount > 4 ? 4 : imgsRestCount;
                            return (
                                <Row>
                                    {Array(colsCount)
                                        .fill(undefined)
                                        .map((_, colIndex) => {
                                            const src = equipmentItem.goodImageUrls![rowIndex * 4 + colIndex];
                                            return (
                                                <Col md={3} mr={2} key={src}>
                                                    <Image src={src} rounded thumbnail />
                                                </Col>
                                            );
                                        })}
                                </Row>
                            );
                        })}
                </Row>
            ) : null}
        </>
    );

    return (
        <Container>
            <Row>
                <Col md={{span: 10, offset: 1}}>
                    <Row>
                        <Row className="my-2">
                            <Col md="3">
                                <Button onClick={onBackClick}>На главную</Button>
                            </Col>
                        </Row>

                        {equipmentItem ? (
                            renderEquipmentInfo(equipmentItem)
                        ) : (
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        )}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default EquipmentPage;
