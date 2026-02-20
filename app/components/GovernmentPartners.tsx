export default function GovernmentPartners() {
  const logos = [
    { name: "NIC", src: "/nic.png" },
    { name: "NABARD", src: "/NABARD.png" },
    { name: "Ministry of Agriculture", src: "/Ministry of Agriculture.png" },
    { name: "NHM", src: "/NHM.png" },
    { name: "CSC e-Gov", src: "/CSC e-Gov.jpeg" },
    { name: "NDAP", src: "/NDAP.png" },
    { name: "MyGov India", src: "/MyGov India.png" },
    { name: "UIDAI", src: "/UIDAI.jpeg" },
  ];

  return (
    <section className="bg-white py-12 overflow-hidden">
      <h2 className="text-center text-2xl font-semibold mb-8">
        Trusted By Government Platforms
      </h2>

      <div className="relative w-full overflow-hidden">
        <div className="flex animate-scroll gap-16 w-max">
          {[...logos, ...logos].map((logo, index) => (
            <div key={index} className="flex items-center justify-center min-w-[180px]">
              <img
                src={logo.src}
                alt={logo.name}
                className="h-16 object-contain grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
