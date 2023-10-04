import React from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { DropdownSelect } from "@kleros/ui-components-library";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const Filters: React.FC = () => {
  const theme = useTheme();
  const { order, filter } = useParams();
  const { ruled, period, ...filterObject } = decodeURIFilter(filter ?? "all");
  const navigate = useNavigate();
  const location = useRootPath();

  const handleStatusChange = (value: string | number) => {
    const parsedValue = JSON.parse(value as string);
    const encodedFilter = encodeURIFilter({ ...filterObject, ...parsedValue });
    navigate(`${location}/1/${order}/${encodedFilter}`);
  };

  const handleOrderChange = (value: string | number) => {
    const encodedFilter = encodeURIFilter({ ruled, period, ...filterObject });
    navigate(`${location}/1/${value}/${encodedFilter}`);
  };

  return (
    <Container>
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: JSON.stringify({}), text: "All Cases", dot: theme.primaryText },
          { value: JSON.stringify({ ruled: false }), text: "In Progress", dot: theme.primaryBlue },
          { value: JSON.stringify({ ruled: true }), text: "Closed", dot: theme.primaryPurple },
          { value: JSON.stringify({ period: "appeal" }), text: "Appeal", dot: theme.tint },
        ]}
        defaultValue={JSON.stringify({ ruled, period })}
        callback={handleStatusChange}
      />
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: "desc", text: "Newest" },
          { value: "asc", text: "Oldest" },
        ]}
        defaultValue={order}
        callback={handleOrderChange}
      />
    </Container>
  );
};

export default Filters;
