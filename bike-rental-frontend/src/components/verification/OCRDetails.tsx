import type { OCRData } from "../../types/verification";

interface Props {
  data: OCRData;
}

const OCRDetails = ({ data }: Props) => {
  return (
    <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl">
      <h2 className="mb-6 text-2xl font-bold">
        Extracted Details
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <Info title="Name" value={data.name} />

        <Info title="Aadhaar Number" value={data.aadhaarNumber} />

        <Info title="Date of Birth" value={data.dob} />

        <Info title="Gender" value={data.gender} />

      </div>

      <div className="mt-6">
        <Info title="Address" value={data.address} />
      </div>

      <details className="mt-8">
        <summary className="cursor-pointer font-semibold">
          Raw OCR Text
        </summary>

        <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-100 p-4 text-sm">
          {data.rawText}
        </pre>
      </details>
    </div>
  );
};

interface InfoProps {
  title: string;
  value: string;
}

const Info = ({ title, value }: InfoProps) => (
  <div>
    <p className="text-gray-500">{title}</p>

    <p className="font-semibold">
      {value || "-"}
    </p>
  </div>
);

export default OCRDetails;