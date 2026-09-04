import { StudentDashboard, type StudentDashboardProps } from "./components/StudentDashboard";
import { AcademicianDashboard, type AcademicianDashboardProps } from "./components/AcademicianDashboard";
import { IndustryDashboard, type IndustryDashboardProps } from "./components/IndustryDashboard";
import { InstitutionDashboard, type InstitutionDashboardProps } from "./components/InstitutionDashboard";

export type DashboardViewProps =
  | ({ role: "STUDENT" } & StudentDashboardProps)
  | ({ role: "ACADEMICIAN" | "FACULTY" } & AcademicianDashboardProps)
  | ({ role: "INDUSTRY" | "INDUSTRIES" } & IndustryDashboardProps)
  | ({ role: "INSTITUTION" | "INSTITUTIONS" | "TPO" } & InstitutionDashboardProps);

export function DashboardContent(props: DashboardViewProps) {
  switch (props.role) {
    case "STUDENT":
      return <StudentDashboard {...props} />;
    case "ACADEMICIAN":
    case "FACULTY":
      return <AcademicianDashboard {...props} />;
    case "INDUSTRY":
    case "INDUSTRIES":
      return <IndustryDashboard {...props} />;
    case "INSTITUTION":
    case "INSTITUTIONS":
    case "TPO":
    default:
      return <InstitutionDashboard {...props} />;
  }
}