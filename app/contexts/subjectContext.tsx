import { getSubjects } from "@/utils/getRoutes";
import { Subject } from "@/utils/models";
import { createContext, useEffect, useState } from "react";

export const SubjectContext = createContext<{
  subjects: Subject[];
  subjNameToIdMap: Record<string, number>;
}>({ subjects: [], subjNameToIdMap: {} });

const SubjectContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjNameToIdMap, setSubjNameToIdMap] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchSubjs = async () => {
      try {
        const res = await getSubjects();
        setSubjects(res);
        const temp: Record<string, number> = {};
        res.forEach(entry => (temp[entry.name] = entry.id));
        setSubjNameToIdMap(temp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubjs();
  }, []);

  return (
    <SubjectContext value={{ subjects, subjNameToIdMap }}>
      {children}
    </SubjectContext>
  );
};

export default SubjectContextProvider;
