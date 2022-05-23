import React from 'react';
import {Pagination} from 'react-bootstrap';

interface Props {
    page: number;
    pagesCount: number;
    setPage: (page: number) => void;
}

const PaginationView: React.FC<Props> = (props) => {
    const firstPage = props.page - 3 < 1 ? null : props.page - 3;
    const prev2Page = props.page - 2 < 1 ? null : props.page - 2;
    const prevPage = props.page - 1 < 1 ? null : props.page - 1;
    const nextPage = props.page + 1 > props.pagesCount ? null : props.page + 1;
    const next2Page = props.page + 2 > props.pagesCount ? null : props.page + 2;
    const lastPage = props.page + 3 > props.pagesCount ? null : props.pagesCount;

    return (
        <Pagination>
            {prevPage ? <Pagination.Prev key="prev" onClick={() => props.setPage(prevPage)} /> : null}
            {firstPage ? (
                <Pagination.Item key="first" onClick={() => props.setPage(1)}>
                    {1}
                </Pagination.Item>
            ) : null}
            {firstPage ? <Pagination.Ellipsis /> : null}

            {prev2Page ? (
                <Pagination.Item key={prev2Page} onClick={() => props.setPage(prev2Page)}>
                    {prev2Page}
                </Pagination.Item>
            ) : null}
            {prevPage ? (
                <Pagination.Item key={prevPage} onClick={() => props.setPage(prevPage)}>
                    {prevPage}
                </Pagination.Item>
            ) : null}
            <Pagination.Item key={props.page} active>
                {props.page}
            </Pagination.Item>
            {nextPage ? (
                <Pagination.Item key={nextPage} onClick={() => props.setPage(nextPage)}>
                    {nextPage}
                </Pagination.Item>
            ) : null}
            {next2Page ? (
                <Pagination.Item key={next2Page} onClick={() => props.setPage(next2Page)}>
                    {next2Page}
                </Pagination.Item>
            ) : null}

            {lastPage ? <Pagination.Ellipsis /> : null}
            {lastPage ? (
                <Pagination.Item key="last" onClick={() => props.setPage(lastPage)}>
                    {lastPage}
                </Pagination.Item>
            ) : null}
            {nextPage ? <Pagination.Next key="next" onClick={() => props.setPage(nextPage)} /> : null}
        </Pagination>
    );
};

export default PaginationView;
